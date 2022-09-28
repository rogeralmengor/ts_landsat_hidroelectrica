/**************************************************************************************************
 * Downloading Image Chips for Hidroelectrica dos Mares
 * Location: El Valle de Las Lomas, Chiriquí, Panamá
 * Author: Roger Almengor González
 * Data 26.09.2022
 * Project: CAP 2022
 * Land: Bayern
 * ***********************************************************************************************/

 // Feature Collection 
var municipalities = ee.List(['Bijagual', 'Chiriquí', 'Cochea', 'David','Las Lomas','Gualaca', 'Rincón',
                            'Paja de Sombrero', 'Caldera', 'Dos Ríos', 'Los Anastacios', 'Dolega', 'Pedregal', 
                            'San Pablo Viejo', 'San Pablo Nuevo', 'San Carlos', 'Hornito', 'Tinajas'])
var AOI = table.filter(ee.Filter.inList('NAME_3', municipalities));
var municipalities = AOI.filter(ee.Filter.eq('NAME_1', 'Chiriquí'));
var district_list = ee.List(['Gualaca', 'Boquete', 'Dolega', 'David'])
var municipalities = municipalities.filter(ee.Filter.inList('NAME_2', district_list))
print(AOI);
Map.addLayer(municipalities);

var cochea_district = table.filter(ee.Filter.eq('NAME_3', 'Chiriquí'))
var centroid_cochea_coor = cochea_district.geometry().centroid().coordinates().getInfo()
var x = centroid_cochea_coor[0];
var y = centroid_cochea_coor[1];
print(x); 
print(y);
Map.setCenter(x, y, 12);


// Elaborating the dates
// Getting Temperatures for Every Month
var period = ['-01-01', '-12-01']; 

var years = [['1999', '2000'],
              ['2000', '2001'],
              ['2001', '2002'],
              ['2002', '2003'],
              ['2003', '2004'],
              ['2004', '2005'],
              ['2005', '2006'],
              ['2006', '2007'],
              ['2007', '2008'],
              ['2008', '2009'], 
              ['2009', '2010'], 
              ['2010', '2011'],
              ['2011', '2012'],
              ['2012', '2013'],
              ['2013', '2014'],
              ];
              
var add_period = function(year){
  var start_date = period[0]; 
  var end_date = period[1];
  return [year[0] + start_date, year[1] + end_date];
};

var visualization = {
  bands: ['SR_B4', 'SR_B3', 'SR_B2'],
  min: 0.0,
  max: 0.4,
};

var visualization_ = {
  bands: ['SR_B4_median', 'SR_B3_median', 'SR_B2_median'],
  min: 0.0,
  max: 0.4,
};

var concatenate_year_with_periods = function(years, period){
  return years.map(add_period);
};

var Dates = concatenate_year_with_periods(years, period);

print(Dates);

/***********************************************************************
                              Landsat 5
************************************************************************/
// Applies scaling factors.
function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBand = image.select('ST_B6').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBand, null, true);
}

var dataset = ee.ImageCollection('LANDSAT/LT05/C02/T1_L2')
    .filterDate('1999-01-01', '2020-12-31')
    .filterBounds(municipalities)
    .map(applyScaleFactors)
    .map(function(image){return image.clip(municipalities)});

//dataset = dataset.map(applyScaleFactors);
print(dataset);

// Creating composites using median pixel value
var median_yearly_landsat_5 = function(start, end){
  var dataset_ =  dataset.filter(ee.Filter.date(start, end));
  var median_yearly = dataset_.reduce(ee.Reducer.median());
  return median_yearly;
};

var composite_name_list = ee.List([]);

var apply_monthly_composite_modis = function(date_list){
    var start = date_list[0];
    var end = date_list[1]; 
    var output_name = start + "TO" + end + "_LANSAT_5";
    var composite = median_yearly_landsat_5(start, end);
    composite_name_list = composite_name_list.add([composite, output_name]);
    Map.addLayer(composite, visualization_, output_name, false);
    Export.image.toDrive({
      image: composite,
      description: output_name,
      fileFormat: 'GeoTIFF',
      crs : 'EPSG:4326',
      folder : 'LANDSAT_LST_LAS_LOMAS',
      region: municipalities
    });
    return 0; 
};

Dates.map(apply_monthly_composite_modis); 

print(composite_name_list);

/**********************************************************************
                              Landsat 7 
***********************************************************************/
var visualization = {
  bands: ['B4', 'B3', 'B2'],
  min: 0.0,
  max: 0.3,
};

var visualization_ = {
  bands: ['B4_median', 'B3_median', 'B2_median'],
  min: 0.0,
  max: 0.3,
  gamma: [0.95, 1.1, 1]
};

// Applies scaling factors.
var cloudMaskL7 = function(image) {
  var qa = image.select('BQA');
  var cloud = qa.bitwiseAnd(1 << 4)
                  .and(qa.bitwiseAnd(1 << 6))
                  .or(qa.bitwiseAnd(1 << 8));
  var mask2 = image.mask().reduce(ee.Reducer.min());
  return image
       //.select(['B3', 'B4'], ['Red', 'NIR'])
       .updateMask(cloud.not()).updateMask(mask2)
       .set('system:time_start', image.get('system:time_start'));
};

var dataset = ee.ImageCollection('LANDSAT/LE07/C01/T1_TOA')
    .filterDate('1999-01-01', '2020-12-31')
    .filterBounds(AOI)
    //.map(applyScaleFactors)
    .map(cloudMaskL7)
    .map(function(image){return image.clip(municipalities)});

//dataset = dataset.map(applyScaleFactors);
print(dataset);

// Creating composites using median pixel value
var median_yearly_landsat_7 = function(start, end){
  var dataset_ =  dataset.filter(ee.Filter.date(start, end));
  var median_yearly = dataset_.reduce(ee.Reducer.median());
  return median_yearly;
};

var composite_name_list = ee.List([]);

var apply_monthly_composite_modis = function(date_list){
    var start = date_list[0];
    var end = date_list[1]; 
    var output_name = start + "TO" + end + "_LANSAT_7";
    var composite = median_yearly_landsat_7(start, end);
    composite_name_list = composite_name_list.add([composite, output_name]);
    Map.addLayer(composite, visualization_, output_name, false);
    Export.image.toDrive({
      image: composite,
      description: output_name,
      fileFormat: 'GeoTIFF',
      crs : 'EPSG:4326',
      folder : 'LANDSAT_LST_LAS_LOMAS',
      region: municipalities
    });
    return 0; 
};

Dates.map(apply_monthly_composite_modis); 

print(composite_name_list);


/**********************************************************************
                              Landsat 8 
***********************************************************************/
// Elaborating the dates
// Getting Temperatures for Every Month
var period = ['-01-01', '-12-01']; 

var years = [['2013', '2014'],
              ['2014', '2015'],
              ['2015', '2016'],
              ['2016', '2017'],
              ['2017', '2018'],
              ['2018', '2019'],
              ['2019', '2020'],
              ];
              
var add_period = function(year){
  var start_date = period[0]; 
  var end_date = period[1];
  return [year[0] + start_date, year[1] + end_date];
};


var visualization_ = {bands:['B5_median', 'B4_median', 'B3_median'], min:0, max:5000};


var concatenate_year_with_periods = function(years, period){
  return years.map(add_period);
};

var Dates = concatenate_year_with_periods(years, period);

print(Dates);


var getQABits = function(image, start, end, newName) {
    // Compute the bits we need to extract.
    var pattern = 0;
    for (var i = start; i <= end; i++) {
       pattern += Math.pow(2, i);
    }
    // Return a single band image of the extracted QA bits, giving the band
    // a new name.
    return image.select([0], [newName])
                  .bitwiseAnd(pattern)
                  .rightShift(start);
};

// A function to mask out cloudy pixels.
var cloud_shadows = function(image) {
  // Select the QA band.
  var QA = image.select(['pixel_qa']);
  // Get the internal_cloud_algorithm_flag bit.
  return getQABits(QA, 3,3, 'cloud_shadows').eq(0);
  // Return an image masking out cloudy areas.
};

// A function to mask out cloudy pixels.
var clouds = function(image) {
  // Select the QA band.
  var QA = image.select(['pixel_qa']);
  // Get the internal_cloud_algorithm_flag bit.
  return getQABits(QA, 5,5, 'Cloud').eq(0);
  // Return an image masking out cloudy areas.
};

var cloudMaskL8 = function(image) {
  var cs = cloud_shadows(image);
  var c = clouds(image);
  image = image.updateMask(cs);
  return image.updateMask(c);
};


var dataset = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
    .filterDate('2013-01-01', '2020-12-31')
    .filterBounds(municipalities)
    //.map(applyScaleFactors)
    .map(cloudMaskL8)
    .map(function(image){return image.clip(municipalities)});

//dataset = dataset.map(applyScaleFactors);
print(dataset);

// Creating composites using median pixel value
var median_yearly_landsat_8 = function(start, end){
  var dataset_ =  dataset.filter(ee.Filter.date(start, end));
  var median_yearly = dataset_.reduce(ee.Reducer.median());
  return median_yearly;
};

var composite_name_list = ee.List([]);

var apply_monthly_composite_modis = function(date_list){
    var start = date_list[0];
    var end = date_list[1]; 
    var output_name = start + "TO" + end + "_LANSAT_8";
    var composite = median_yearly_landsat_8(start, end);
    composite_name_list = composite_name_list.add([composite, output_name]);
    Map.addLayer(composite, visualization_, output_name, false);
    Export.image.toDrive({
      image: composite,
      description: output_name,
      fileFormat: 'GeoTIFF',
      crs : 'EPSG:4326',
      folder : 'LANDSAT_LST_LAS_LOMAS',
      region: municipalities
    });
    return 0; 
};

Dates.map(apply_monthly_composite_modis); 

print(composite_name_list);