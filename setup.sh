#!/bin/bash -ex
#
# Test cluster instance setup script
#
# This file will be executed on each instance in the
# test cluster. It can be used to perform initial
# OS configuration after a test cluster is created.
#
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y npm build-essential curl
sudo npm i -g npm n
sudo n stable
