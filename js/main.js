'use strict'
const   cnf = {
            main:{
                locale:'es',
                UI:{
                    '.navbar-brand':'awaLogo',
                    '.form-group #InputTags':'tagsToSearch',
                    '#SearchMode option[value=0]':'includeAllTags',
                    '#SearchMode option[value=1]':'includeAnyTag',
                    'button#SearchByTags':'searchButton',
                    '.bodyResults .alert':'welcomeBoardMSG',
                    '#localeSelector option[value=0]':'es-ES',
                    '#localeSelector option[value=1]':'en-GB',
                }
            },
            Flickr:{
                APIURL:'https://www.flickr.com/services/feeds/photos_public.gne?jsoncallback=?',
                lang:'es-us'
            },
            table:{
                el:{
                    mainTableEl:'.ResultsTable',
                    mainTableResultsEl:'.bodyResults'
                }
            },
            form:{
                el:{
                    localeSelector:'select#localeSelector',
                    tagsInput:'.form-control#InputTags',
                    submitButton:'form.form-inline button#SearchByTags'
                }
            }
        },
        lang = {
            es:{
                UI:{
                    'awaLogo':'awa',
                    'tagsToSearch':'Etiquetas a buscar',
                    'includeAllTags':'Que uncluya todas',
                    'includeAnyTag':'Que incluya algunas',
                    'searchButton':'Buscar',
                    'error':'Error.',
                    'noValidTagOnInput':'Intriduce etiquetas válidas.',
                    'noResults':'Sin resultados.',
                    'noValidImagesFound':'No se encontraron imágenes válidas.',
                    'welcomeBoardMSG':'<h4 class="alert-heading">Busqueda de imágenes en Flickr en base a etiquetas.</h4><p>Introduce etiquetas en el formulario superior y selecciona el mode de búsqueda.</p>',
                    'errorBoardMSG':'<h4 class="alert-heading">Sin Resultados.</h4><p>No se encontraron imágenes valídas.</p>',
                    'es-ES':'Castellano',
                    'en-GB':'Inglés'
                },
                table:{
                    header:{
                        title:'Título',
                        author:'Autor',
                        date:'Fecha',
                        thumbnail:'Miniatura',
                        tags:'Etiquetas',
                        link:'Enlace'
                    },
                    row:{
                        linkText:'Visitar'
                    }
                }
            },
            en:{
                UI:{
                    'awaLogo':'awa',
                    'tagsToSearch':'Tags to search',
                    'includeAllTags':'Including all tags',
                    'includeAnyTag':'Including some tags',
                    'searchButton':'Search',
                    'error':'Error.',
                    'errorBoardMSG':'',
                    'noValidTagOnInput':'Please input valid tags.',
                    'noResults':'No results.',
                    'noValidImagesFound':'Not valid images found.',
                    'welcomeBoardMSG':'<h4 class="alert-heading">Search images on Flickr based on tags.</h4><p>Please type in some space-separated tags in the firt input area of the form above and select de search mode in the second.</p>',
                    'errorBoardMSG':'<h4 class="alert-heading">Not found.</h4><p>No valid images found.</p>',
                    'es-ES':'Spanish',
                    'en-GB':'English'
                },
                table:{
                    header:{
                        title:'Title',
                        author:'Author',
                        date:'Date',
                        thumbnail:'Thumbnail',
                        tags:'Tags',
                        link:'Link'
                    },
                    row:{
                        linkText:'Go'
                    }
                }
            }
        };
let cd = {
    localeSet:{
        main:0
    }
}
/**
 * Función base que se ejecuta cuando el documento se ha cargado por completo para el usuario.
 */
$(document).ready(function() {
    (function (){
        localeSet();
        $(cnf.form.el.localeSelector).change(function() {
            const   selectedLocale = $(this).find('option:selected').index(),
                    localeSw = (langIndex) => ({
                                    0:"es",
                                    1:"en"
                                })[langIndex],
                    varLocaleSet = localeSw(selectedLocale);

            cnf.main.locale = localeSet(varLocaleSet)
        });
    
        /**
         * Lógica para botón.
         * Ejecuta la función callFlickrAPI() y procesa posibles errores.
         */
        $(cnf.form.el.submitButton).click(function(e) {
            e.preventDefault();
            try {
                callFlickrAPI()
            } catch(err) {
                insertErrorAlert(err)
            }
        })
    })()
});

/**
 * getTagsFromInput:
 * Obtiene cadena del input de etiquetas, elimina espacios innecesarios, 
 * comprueba que la cadena contenga texto y de ser que sí, lo devuelve.
 * En caso contrario genera un error.
 */
function getTagsFromInput() {
    let el = $(cnf.form.el.tagsInput).click(function() {$(this).removeClass('is-invalid')});
    const   elSan = $.trim(el.val());

    if(!elSan) {
        el.addClass('is-invalid');
        throw lang[cnf.main.locale].noValidTagOnInput
    }
    return elSan.split(/\s+/).join()
};

/**
 * getSearchMode:
 * Obtiene el índice numérico del valor seleccionado dentro del elemento Select del modo de búsqueda
 * y según su valor devuelve el argumento correspondiente como cadena.
 */
function getSearchMode() {
    return $('.form-control#SearchMode option:selected').index()?'any':'all'
};

/**
 * callFlickrAPI:
 * Genera la llamada asíncrona a la API de Flickr a partir de la URL base junto a valores obtenidos de anteriores funciones
 * y procesa la respuesta obtenida.
 */
function callFlickrAPI() {
    const APIURL = cnf.Flickr.APIURL;

    $.getJSON(APIURL, {
        format: 'json',  
        lang:   cnf.Flickr.lang,
        tags:   getTagsFromInput(),
        tagmode:getSearchMode()
    }).done(function(data) {
        if(data.items.length) {
            genResultsTable();
            $.each(data.items, function(i, item) {
                popResultsTable(item.title,item.author,item.published,item.media.m,item.tags,item.link)
            });
            return true
        }
        insertErrorAlert(lang[cnf.main.locale].noResults,lang[cnf.main.locale].noValidImagesFound)
    })
};

/**
 * genResultsTable:
 * Genera la base de la tabla para posteriormente poblarla con los resultados obtenidos de la API de Flickr.
 */
function genResultsTable() {
    const   tableBase = '<table class="table ResultsTable table-striped table-bordered table-hover w-auto">' +
                        '<thead class="thead-dark"><tr><th scope="col"></th>' +
                        '<th scope="col"></th><th scope="col"></th><th scope="col"><th scope="col">' + 
                        '</th><th scope="col"></th></tr></thead><tbody></tbody></table>',
            tableEl = cnf.table.el.mainTableEl,
            resultsEl = cnf.table.el.mainTableResultsEl;

    /** Si la tabla existe elimina las filas que contenga para ser reemplazadas por nuevas. */
    (!$(tableEl).length)?$(resultsEl).empty().append($(tableBase).hide().fadeIn()):$(tableEl+' tbody tr').fadeOut('slow',function() {$(this).remove()})
};

/**
 * popResultsTable:
 * Función usada por callFlickrAPI() para rellenar la tabla de genResultsTable() con los resultados obtenidos, separados por filas.
 * El valor de Autor es filtrado para obtener sólo el valor entre comillas usando expresión regular.
 * El valor de Miniatura es asignado a un elemento de imagen para su correcta visualización en la tabla.
 * El valor de Enlace es asignado a un botón para una mejor interacción.
 */
function popResultsTable(title,author,date,thumbnail,tags,link) {
    const   resultsTabEl = cnf.table.el.mainTableEl;
    let template =  '<tr><td>' + title +'</td><td>' + author.match(/"(.*?)"/)[1] +'</td><td>' + date +
                    '</td>+<td><img src=' + thumbnail + ' title=' + title + ' alt=' + title +
                    '></td><td>' + tags +'</td><td><a class="btn btn-msr1" href=' + link +
                    ' target="_blank" role="button">' + lang[cnf.main.locale].table.row.linkText + '</a></td></tr>';
                    
    /** Las filas son añadidas a la tabla y mostradas usando una animación de fundido: */
    $(resultsTabEl).append($(template).hide().fadeIn())
};

function insertErrorAlert(err,des) {
    const   resultsEl = cnf.table.el.mainTableResultsEl;
    let error = err ||  lang[cnf.main.locale].error,
        desc = des  ||  error,
        template =  '<div class="alert alert-danger" role="alert" awa-lng="errorBoardMSG">' +
                    '<h4 class="alert-heading"></h4><p></p></div></div>';
    
    $(resultsEl).empty().append($(template).hide(10,function() {localeSet()}).fadeIn(250))
};

function localeSet(setLocale) {
    let locale = setLocale || cnf.main.locale,
        locArray = Object.entries(cnf.main.UI),
        lngClass = 'awa-lng';

    if(cd.localeSet.main < 1){
        console.warn('localeSet to: ' + locale + '\n' + 'First localseSet Run: '+ cd.localeSet.main)
        cd.localeSet.main++;
        for (const [clss, txt] of locArray) {
            $(clss).attr(lngClass,txt)
        }
    }

    $.each($('[' + lngClass + ']'),function() {
        let base = $(this).attr(lngClass),
            hasAttr = $(this).attr('placeholder'),
            localeSetto = lang[locale].UI[base];
        
        if (typeof hasAttr !== typeof undefined && hasAttr !== false) {
            $(this).attr('placeholder', localeSetto)
        }
        $(this).html(localeSetto)
    });

    console.warn('localeSet to: ' + locale + '\n' + 'First localseSet Run: '+ cd.localeSet.main)
    return locale
};