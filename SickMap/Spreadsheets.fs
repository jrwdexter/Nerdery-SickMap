namespace Sickmap

open Google.GData.Spreadsheets

module Spreadsheets =

  let GetSpreadsheet (name:string) (service:SpreadsheetsService) =
    new SpreadsheetQuery()
    |> fun sq -> service.Query(sq).Entries
    |> Seq.map (fun spreadsheet -> spreadsheet :?> SpreadsheetEntry)
    |> Seq.pick (fun s -> if s.Title.Text.ToString() = name then Some(s) else None)

  let GetWorksheet (name:string) (spreadsheet:SpreadsheetEntry) =
    spreadsheet
    |> fun s -> s.Worksheets.Entries
    |> Seq.map (fun worksheet -> worksheet :?> WorksheetEntry)
    |> Seq.pick (fun w -> if w.Title.Text.ToString() = name then Some(w) else None)

  let GetCells (service:SpreadsheetsService) (worksheet:WorksheetEntry) =
    worksheet.CellFeedLink
    |> fun l -> new CellQuery(l)
    |> service.Query
    |> fun q -> q.Entries
    |> Seq.map (fun cell -> cell :?> CellEntry)

  type Cell = { RowCol:string; Value:string; }