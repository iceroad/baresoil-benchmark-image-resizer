# Baresoil Image Resizing API Benchmark

This benchmark is for reproducibly measuring the real-world performance and cost
of hosting a simple image processing API on a Baresoil cluster running
on AWS.

#### [Latest Benchmark Report](https://iceroad.github.io/baresoil-benchmark-image-resizer/) · [Demo](https://img.baresoil.cloud/) · [Homepage](https://www.baresoil.org/)

The API accepts JPEG image uploads via HTTP POST requests, and uses GNU ImageMagick to return the following results:

  * a data URL representation of a cropped, oriented, square thumbnail of the upload, up to 128x128 pixels, stripped of metadata.
  * a data URL representation of an oriented, resized, and color-corrected version of the upload, up to 640x640 pixels, stripped of metadata.
  * A JSON object containing all Exif camera metadata found in the uploaded image.

The project's client component contains a simple web UI to invoke the API and display its results.

## Requirements

Install the Benchoid cloud benchmarking framework:

    npm install -g benchoid

Benchoid requires **Terraform**, **OpenSSH**, and **rsync** available on your system, and an AWS access key.

Download or clone this repository into a directory and run the commands below inside it.

## Subdirectories

  * agent: Simulated user agent to generate traffic.
  * analysis: Scripts for processing experimental data output.
  * project: Baresoil app project to be deployed to the server.
  * render: Template for generating reports.
  * run_data: Experimental data generated by Benchoid.

## Instructions

  1. Deploy the Baresoil project in the `project` directory to the
     server that is to be load tested. Change the variable `ENDPOINT` in
     the file `agent/main.js` to point to the top-level domain name of the
     server. If using HTTPS, ensure that the protocol is set to `wss://`
     rather than `ws://`.
  2. Run `benchoid create-cluster` in the current directory to generate
     Terraform files to provision a client cluster to be used for generating
     artificial traffic to the target server or load balancer.
  3. Run `benchoid setup-cluster` to execute the contents of setup.sh in
     parallel on all client tier machines.
  4. Run `benchoid sync` to rsync the contents of the `agent` directory to
     all hosts in the client tier.
  5. Run `benchoid run` to prompt for parameters for a new experimental run
     and then to execute the agent according to those parameters.
  6. Run `benchoid analyze` to run analysis functions on the raw event data.
  7. Run `benchoid render` to create a self-contained HTML report in the
     `dist` subdirectory.

