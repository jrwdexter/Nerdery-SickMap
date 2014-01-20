namespace Sickmap

open Raven.Client.Embedded

module Raven =
  let DocumentStore = new EmbeddableDocumentStore()
  DocumentStore.DataDirectory <- "RavenData"
  DocumentStore.Initialize() |> ignore
