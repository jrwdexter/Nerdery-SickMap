namespace Sickmap

open Nancy
open Nancy.Authentication.Basic
open Nancy.Bootstrapper
open Nancy.Conventions
open Nancy.Security
open Nancy.Session
open Nancy.TinyIoc

/// <summary>
/// The bootstrapper for starting the nancy application.
/// </summary>
type Bootstrapper() =
  inherit DefaultNancyBootstrapper()

  /// <summary>
  /// Overridden conventions to add the "Scripts" folder to static content folders.
  /// </summary>
  /// <param name="nancyConventions">The set of conventions that nancy passes in.</param>
  override this.ConfigureConventions(nancyConventions : NancyConventions) = 
    nancyConventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("Scripts", "Scripts"))
    nancyConventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("docs", "docs"))
    base.ConfigureConventions(nancyConventions)
  
  override this.ApplicationStartup(requestContainer : TinyIoCContainer, pipelines : IPipelines) =
    CookieBasedSessions.Enable(pipelines) |> ignore
    base.ApplicationStartup(requestContainer, pipelines)
