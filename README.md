<img src="plattform.svg"> <img src="programming_language.svg">

# ts_landsat_hidroelectrica
Generation of an animation gif with landsat  7 images

<div style="text-align:center"> 
<p align="center">
  <img src="7a61c9222b70380ae1af62d5bb9c037b-db111cdad73d3c20167df8fe4ce6f6e2.gif" width="250" title="hover text">
</p>
</div>

## Installation
The code is to be executed in the code editor of Google Earth Engine.
Nothing needs to be installed. You only have a gmail account.
More information regarding Google Earth Engine: 
https://developers.google.com/earth-engine 

## Usage
You can use the code to generate time series animation in gif format for landsat 7 imagery. There is other dataframes
such as Sentinel-2 to use them for the generation of timelapse animations. With changes on the image collection or 
the geometry you can make use of this code for your own project. This code has been developed by creating two-year
composites on Landsat-7 imagery, in a false color composite using the near infrared, red and green bands. 
This animation was created as support for the blog post on my website:<br>
https://roger-almengor.xyz/?p=447

## Dependencies
This timelapse uses the *text* package developed by  Gennadii Donchyts, to add text on every frame on the animation. 
sers/gena/packages:text 
https://gis.stackexchange.com/users/99557/gennadii-donchyts

## Support
Support is welcomed. I also can give you support in case bugs arise. Just write an E-Mail, or raise the issue on GitHub.

## Contributing
Fork the repository if you need to develop some other functionalities, or modify the already implemented. 
In case you want to make a push request into master, just contact me, or make the push request.. I'll notice
that. 


## Authors and acknowledgment
Roger Almengor González (developer and mantainer)
* E-Mail: rogeralmengor@gmail.com 
* E-Mail2: thebeautyofthepixel@gmail.com
* E-Mail3: almrog16@gmail.com

## License
MIT

## Project status
Generates Time Series of Lansat 7 Imagery. 2do: Temperature Analysis
