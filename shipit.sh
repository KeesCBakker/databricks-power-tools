#!/bin/bash

rm -f databricks-power-tools.zip
cd app
zip -r ../databricks-power-tools.zip . -x *screenshot*.*