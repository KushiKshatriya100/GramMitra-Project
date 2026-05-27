# Local-dev launcher for GramMitra backend.
# Activates the `local` Spring profile so application-local.properties is loaded.
# Usage:   .\run-local.ps1
#
# (Do not use this for prod — set real env vars and run `mvn spring-boot:run`.)
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
