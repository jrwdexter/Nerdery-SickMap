namespace Sickmap.OAuth

open System
open System.IO
open System.Configuration

open Google.GData.Client

open Raven.Client.Document
open Sickmap.Raven

/// <summary>
/// Defines a simple record type to house both a user's Google OAuth access and their refresh access.
/// </summary>
type TokenRecord = { Email: string; mutable AccessToken: string; RefreshToken: string; }

module Tokens =
  let AddOrUpdateTokenRecord (record : TokenRecord) =
    use session = DocumentStore.OpenSession()
    let foundRecord = session.Query<TokenRecord>().Customize(fun x -> x.WaitForNonStaleResults() |> ignore)
                      |> Seq.tryFind(fun t -> t.Email = record.Email)
    match foundRecord with
    | Some(trackedRecord) ->
      trackedRecord.AccessToken <- record.AccessToken
      session.SaveChanges()
      trackedRecord
    | None ->
      session.Store(record)
      session.SaveChanges()
      record


  let GetTokenRecord (email : string) = 
    use session = DocumentStore.OpenSession()
    session.Query<TokenRecord>().Customize(fun x -> x.WaitForNonStaleResults() |> ignore)
    |> Seq.tryFind(fun t -> t.Email = email)

  let GetEmailFromSession(request : Nancy.Request) = 
    match request.Session.["Email"] :?> string with
    | null -> None
    | email -> Some(email)

  let GetAccessToken(request : Nancy.Request) =
    match GetEmailFromSession(request) with
    | Some(email) -> GetTokenRecord(email)
    | None -> None

module Google =
  let (?) (parameters:obj) param =
      (parameters :?> Nancy.DynamicDictionary).[param]

  let private setParameters (parameters : OAuth2Parameters) =
    parameters.ClientId <- System.Configuration.ConfigurationManager.AppSettings.["OAuth-ClientId"]
    parameters.ClientSecret <- ConfigurationManager.AppSettings.["OAuth-ClientSecret"]
    parameters.RedirectUri <- ConfigurationManager.AppSettings.["OAuth-RedirectURI"]
    parameters.ResponseType <- "code"
    parameters.Scope <- "https://spreadsheets.google.com/feeds https://docs.google.com/feeds https://mail.google.com/ https://www.googleapis.com/auth/userinfo.email"
    parameters

  let private authorize (parameters : OAuth2Parameters) =
    OAuthUtil.CreateOAuth2AuthorizationUrl(parameters)

  let private setAccessToken (token:string) (parameters:OAuth2Parameters) =
    parameters.AccessToken <- token
    parameters

  let private setRefreshToken (refreshToken:string) (parameters:OAuth2Parameters) =
    parameters.RefreshToken <- refreshToken
    parameters

  let private getEmailAddress (token:string) =
    System.Net.WebRequest.Create("https://www.googleapis.com/userinfo/email?alt=json&access_token=" + token)
    |> fun req -> req.GetResponse()
    |> fun res -> new StreamReader(res.GetResponseStream())
    |> fun sr -> sr.ReadToEnd()
    |> Newtonsoft.Json.Linq.JObject.Parse
    |> fun json -> json.["data"].["email"].ToString()

  let GetAuthorizationUrl = 
    new OAuth2Parameters() 
    |> setParameters 
    |> authorize

  let Authorize (request : Nancy.Request) =
    let parameters = new OAuth2Parameters() |> setParameters
    parameters.AccessCode <- request.Query?code.ToString()
    OAuthUtil.GetAccessToken(parameters)
    let email = getEmailAddress(parameters.AccessToken)
    { Email = email; AccessToken = parameters.AccessToken; RefreshToken = parameters.RefreshToken;  }

  let GetSpreadsheetService(request : Nancy.Request) = 
    match Tokens.GetEmailFromSession(request) with
    | Some(email) ->
      match Tokens.GetTokenRecord(email) with
      | Some(record) ->
        let requestFactory = GOAuth2RequestFactory(null, "SickMap", new OAuth2Parameters() |> setAccessToken(record.AccessToken) |> setRefreshToken(record.RefreshToken))
        let ss = new Google.GData.Spreadsheets.SpreadsheetsService("SickMap")
        ss.RequestFactory <- requestFactory
        ss |> Some
      | None -> None
    | None -> None

  let GetImapClient (request : Nancy.Request) = 
    match Tokens.GetEmailFromSession(request) with
    | Some(email) ->
      match Tokens.GetTokenRecord(email) with
      | Some(record) ->
        let client = new ImapX.ImapClient("imap.gmail.com", true)
        if(client.Connect()) then
          if(client.Login(new ImapX.Authentication.OAuth2Credentials(record.Email, record.AccessToken))) then
            Some(client)
          else
            None
        else None
      | None -> None
    | None -> None
