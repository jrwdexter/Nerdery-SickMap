namespace Sickmap

open System
open System.Configuration
open System.Net
open System.Text.RegularExpressions
open System.Xml.Linq

open Google.GData.Client
open Google.GData.Spreadsheets

open HtmlAgilityPack

open Nancy
open Nancy.Security
open Spreadsheets

type IndexModule() as x =
    inherit NancyModule()

    do x.Get.["/"] <- fun _ -> 
      let ss = OAuth.Google.GetSpreadsheetService(x.Request)
      match x.Request.Session.["Email"] with
      | null ->
        OAuth.Google.GetAuthorizationUrl 
        |> x.Response.AsRedirect 
        |> box
      | _ ->
        x.View.["index"]
        |> box

    do x.Get.["/seating"] <- fun _ ->
      let ss = OAuth.Google.GetSpreadsheetService(x.Request)
      match ss with
        | Some(service) ->
          service
          |> Spreadsheets.GetSpreadsheet("SeatingChart")
          |> Spreadsheets.GetWorksheet("Bloomington")
          |> Spreadsheets.GetCells(service)
          |> Seq.where (fun c -> c.Value <> null && c.Value.Length > 2)
          |> Seq.map (fun c -> { RowCol = c.Title.Text; Value = c.Value })
          |> Newtonsoft.Json.JsonConvert.SerializeObject
          |> box
        | None ->
          null

    do x.Get.["/sick"] <- fun _ ->
      match OAuth.Google.GetImapClient(x.Request) with
      | Some(client) ->
        client
        |> Sickmap.Mail.GetNewestEmailMatching("Notice Update for")
        |> (fun message -> message.Body.Text.Split('\r'))
        |> Seq.filter(fun entry -> entry.Contains("(") && entry.Contains("PTO") && not(entry.Contains("back")))
        |> Seq.map (fun entry -> Regex.Replace(entry, "\\(.*\\)","").Trim())
        |> Newtonsoft.Json.JsonConvert.SerializeObject
        |> box
      | None -> null

    do x.Get.["/authorize"] <- fun _ -> 
      x.Request
      |> OAuth.Google.Authorize
      |> OAuth.Tokens.AddOrUpdateTokenRecord
      |> (fun r -> x.Request.Session.["Email"] <- r.Email)
      x.Response.AsRedirect("/")
      |> box

