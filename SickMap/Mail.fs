namespace Sickmap

open System
open System.Text
open ImapX
open ImapX.Authentication

module Mail =
  let GetNewestEmailMatching (name:string) (client:ImapClient) =
    let sinceDate = DateTime.Now.AddDays(-3.0).ToString("dd-MMM-yyyy")
    let query = String.Format("SINCE \"{0}\" SUBJECT \"{1}\"", sinceDate, name)
    client.Folders.All.Search(query, Enums.MessageFetchMode.Full, 50)
    |> Seq.last
