#!/bin/bash

dotnet restore
dotnet lambda package -c Release -f netcoreapp2.0 -o bin/deploy-package.zip