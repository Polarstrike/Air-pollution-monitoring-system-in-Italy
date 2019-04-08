var activeMenu;
var tmpMenu;
var firstTimeMap = 0;
var firstTimeHeat = 0;
var firstTimeChoro = 0;
var firstTimeSearch = 0;
  //prevent multiple execution of same function
var dataProcessAlreadyRun = 0;
var quickDataProcessAlreadyRun = 0;
var heatProcessAlreadyRun = 0;
var inquinantiFirstTime = 0;
var cacheFirstTime = 0;

var is_mobile = $(window).width() < 768;


$(document).ready(function(){

  //console.log('window.location.hash: '+ window.location.hash);
  var allowed_ids = ['#iqa', '#sostanze', '#mappa', '#heat', '#choro','#ricerca','#predizione'];//aggiunta
  if (allowed_ids.indexOf(window.location.hash) == -1){
    window.location.hash = tmpMenu = 'home';
    //console.log('reset to home');
  }
  else{
    tmpMenu = window.location.hash.replace('#','');
    //console.log('kept');
  }

    //google chart ini
    google.charts.load('current', {packages: ['corechart', 'line']});

    //
    $('#home-content').load('templates/home_content.html').hide();
    //
    $('#iqa-content').load('templates/iqa_content.html').hide();
    //
    //$('#sostanze-content').load('templates/sostanze_content.html').hide()
    //
    $('#sostanze-content').load('templates/sostanze_content.html', null, function() {
      $(".section-title").click(function(){
        if($(this).siblings(".section-description").is(":visible")){
          $(this).siblings(".section-description").hide();
          $(this).removeClass("active");
        }
        else{
          $(this).parent().siblings().children(".section-description").hide();
          var offset = $(this).offset().top;
          $(this).siblings(".section-description").show();
          $(this).addClass("active");
          $(this).parent().siblings().children(".section-title").removeClass("active");

        }
      });
    }).hide();
    //
    $('#mappa-content').load('templates/mappa_content.html').hide();
    //
    $('#heat-content').load('templates/heat_content.html').hide();
    //
    $('#choro-content').load('templates/choro_content.html').hide();
    //
    $('#ricerca-content').load('templates/ricerca_content.html').hide();

    //
  	$('#predizione-content').load('templates/predizione_content.html').hide();


    //$('#menu-home').addClass('active');    //init home menu in white color
    //$('#home-content').toggle();        //toggle home menu          //toggle = not(previousState)
    //swap('home');
    //console.log('real target is: '+tmpMenu);
    swap(tmpMenu);

});



function swap(id, value){
//console.log('swap run with: '+id);
    $('#'+activeMenu+'-content').hide();             //hide active menu
    $('#menu-'+activeMenu).removeClass('active');   //remove white color
    $('#menu-'+id).addClass('active');              //give white to the new highlighted menu
    $('#'+id+'-content').show(0, function()
    {
      ini = new Date();
      //callback function
      window.location.hash = activeMenu = id;                                //update actual menu variable
      //console.log('new activeMenu: '+activeMenu);


      if(activeMenu == 'mappa'){
        if(firstTimeMap == 0){
              firstTimeMap = 1;
              $('#main-content').addClass('loading');
              setTimeout(function(){                                          //timedelay!!!!!!!!!!!!! .slow() è slow è.è

                inquinantiRead();   //read inquinanti from db, ready to use in map and search
                mapIni();
                legend();
                filterTab();
                readData();
                zoomOn(value);
                $(document).ajaxStop(dataProcess);   //will execute main once ASYNC ajax calls are done
              }, 100);
        }
        else
          zoomOn(value);


        $("#side-menu").addClass("collapsed");      //collapse menu if it's map
      }
      //    HEATMAP
      else if(activeMenu == 'heat'){
          if(firstTimeHeat == 0){
              firstTimeHeat = 1;
              setTimeout(function(){
                  heatIni();
                  readHeatMarker();
                  inquinantiRead();
                  cacheRead();
                  $(document).ajaxStop(heatProcess);   //will execute main once ASYNC ajax calls are done
              }, 150);
          }
        $("#side-menu").addClass("collapsed");      //collapse menu if it's heatmap
      }
      else if(activeMenu == 'choro'){
        if(firstTimeChoro == 0){
          firstTimeChoro = 1;

              choro_inquinantiRead();   //read inquinanti from db, ready to use in map and search
              choro_cacheRead();
              choro_readMarker();
                setTimeout(function(){
                  choroIni();
                }, 500);
        }
        $("#side-menu").addClass("collapsed");      //collapse menu if it's searchtab
      }
      else if(activeMenu == 'ricerca'){
        if(firstTimeSearch == 0){
          firstTimeSearch = 1;
          setTimeout(function(){
            $( "#menu_reg2" ).prop( "disabled", true );
            $('#seleziona-regione3').hide();
            $( "#data" ).datepicker({
              dateFormat: 'dd/mm/yy'
            });
            $('#data1').hide();
            $('#searchResult').hide();
            inquinantiRead();   //read inquinanti from db, ready to use in map and search
            cittaRead();
            cittaDeviceRead();
            $(document).ajaxStop(mainSearch);   //will execute main once ASYNC ajax calls are done
          }, 100);
        }
        $("#side-menu").addClass("collapsed");      //collapse menu if it's searchtab
      }
      else {  //other menu
        $("#side-menu").removeClass("collapsed");   //expand menu if it's not map or heatmap
      }
    });                  //toggle new menu content

}
