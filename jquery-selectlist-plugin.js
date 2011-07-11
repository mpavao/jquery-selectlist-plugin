/**
 * jQuery Selectlist Plugin
 *
 * A jQuery plugin for creating great looking (multiple) selectlists
 * http://mitchellpavao.com
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Version 0.1.20110711
 *
 * Copyright 2011 Mitchell Pavao 
 */

(function($){  
	 $.fn.selectlist = function(options) {  
	  	
	    // default option values
        var defaults = {
            button_display_type: 'count',
            minimum: 0,
            selected: [],
            button_html: '',
            classes: {
            	ul: '',
            	li: '',
            	button: '',
            	button_link: ''
            },
            new_list_item: {
            	url: '',
            	params: {}
            }    
        };
             
        // set options
        var options =  $.extend(defaults, options);
        
        // member variables for 
        var el = {
        	container: false, // entire container for menu_button, select tag, list, etc
        	select: false,  // select tag
        	button: false,  // create html list, link with select tag, get list (ul)
        	list: false  // setup menu button, get menu button
        };
        
        
        // init / setup the select tag
        var select_init = function()
        {
        	return el.container.find('select');
        };
    
    
    	// toggle the button status, as well as the list status
        var button_toggle = function()
        {
	        // handle showing or not showing the list
			if (el.button.hasClass('selected'))
			{
				el.container.find('ul.selectlist').hide();
				el.button.removeClass('selected');
			}
			else
			{
				el.container.find('ul.selectlist').show();
				el.button.addClass('selected');
			}
        };
        
        
        // init / create the menu button 
       	var button_init = function()
       	{
       		// find menu button container
			el.button = (options.classes.button) ? el.container.find('.' + options.classes.button) : el.container.find('div');
			
			// store the default button html
			defaults.button_html = el.button.html();
			
			// add link in button
			el.button.html('<a href="" class="selectlist-button-link '+options.classes.button_link+'">'+el.button.html()+'</a>');
			
			// onclick for the menu button
			el.button.find('a').click(function()
			{
				button_toggle();
				
				return false;
			});
			
			return el.button;
       	};
       	
       	
       	// handle button txt
       	var button_update = function()
		{
			selected_option_count = el.select.find('option:selected').length;
			
			// if no options selected, show default html
			if (selected_option_count == 0)
			{
				el.button.find('a').html(defaults.button_html);
				return true;
			}
			
			// update button txt if necessary
			if (options.button_display_type == 'count')
			{
				var button_html = selected_option_count + ' Collection';
				
				// add an S if plural (todo: handle 's', 'es' or no 's')
				if (selected_option_count > 1)
				{
					button_html = button_html + 's';
				}
				
				// if only one result, show the name of the one
				else if(selected_option_count == 1)
				{
					button_html = el.select.find('option:selected').html();
				}
				
				el.button.find('a').html('<span>' + button_html + '</span>');
			}
			
			return true;
		}
       	
       	
       	// create the ul, li html list, link with the select tag list
       	var list_init = function()
       	{	
       		el.list = $('<ul class="selectlist '+options.classes.ul+'" style="display:none;"></ul>');
       		
       		el.list.attr('tabindex', -1);
    	
    		// don't let the event propagate, so the menu will stay open 
    		el.list.click(function(event) 
    		{
    			event.stopPropagation();
			});
			
			// hide the menu if the user clicks elsewhere
			$('body').click(function() 
			{
				// only hide list if it is showing
				if (el.button.hasClass('selected'))
				{
					button_toggle();
				}
			});
       		
       		// start count at 0, used for unique id
       		var count = 0;
       		
       		// hide the select tag
			el.select.hide();
			
			// link select tag options with their corresponding li elements	
			el.select.find('option').each(function()
			{
				var unique_id = 'selectlist-a-'+(count++);
				var $option   = $(this);
				
				// add the unique id as a class to the current element.
				$option.addClass(unique_id);
				
			    // create the list element
			    var $li_element = $('<li><a id="'+unique_id+'" href="javascript:;" onclick="return false;" rel="'+$option.val()+'"><span>'+$option.html()+'</span></a></li>');
			    
			    el.list.append($li_element);
			    			    
			    // make sure to mark selected
			    if ($(this).attr('selected') == true)
			    {
			    	$li_element.find('a').addClass('selected');
			    }
			});
			
			// add a create list item li
			if (options.new_list_item.url != '')
			{
				var $new_item       = $('<li class="selectlist-option"><input type="text" name="new_list_item" placeholder="Create New Collection" /></li>');
				el.list.append($new_item);
				var $new_item_input = $new_item.find('input');
				
				$new_item_input.keypress(function(event)
				{
					// if the user hits enter, submit the new field
					if (event.keyCode == '13')
					{	
						// prevent enter key from submitting a parent form (if present)
						event.stopPropagation();
						event.preventDefault();
						
						var params = $.extend({ new_list_item: $new_item_input.val() }, options.new_list_item.params);
						
						$.post(options.new_list_item.url, params, function(xml)
							{
								if ($('status', xml).text() == 'success')
						        {
						        	// create new unique id
						        	var unique_id = 'selectlist-a-new-'+$('option_value', xml).text();
						        	
						        	// create new list item
						        	$new_item.before('<li><a id="'+unique_id+'" href="javascript:;" onclick="return false;" rel="'+$('option_value', xml).text()+'"><span>'+$('option_name', xml).text()+'</span></a></li>');
						        	
						        	// create new select option
						        	el.select.append('<option value="'+$('option_value', xml).text()+'" class="'+unique_id+'">'+$('option_name', xml).text()+'</option>');
						        	$new_item_input.val('');
						        	list_item_init();
						       	}
						       	else
						       	{
						       		alert($('message', xml).text());
						       	}
						});
					}
				});
			
				
			}
						
			el.select.before(el.list);
			
			return el.list;
       	};
       	
       	
       	// setup list element (li) onclick
       	var list_item_init = function()
       	{
       		// onclick for list items
			el.list.find('li a').each(function()
			{
				$(this).click(function()
				{		
					var $link = $(this);						
				
					// deselecting item
					if ($link.hasClass('selected'))
					{													
						unselect_item($link, el.select);
					}
					
					// selecting
					else
					{				
						select_item($link);
					}
					
					button_update();
					
					return false;
				});
			});
       	};
        
        
        // select an item & option
    	var select_item = function($link)
    	{
    		// unique id connects the list item with the select option
    		var unique_id = $link.attr('id');
    	
    		// select option
			$('.'+unique_id).attr('selected','selected');
			// select item
			$link.addClass('selected');
			
			return true;
    	}
        
        
        
        // select an item & option
    	var unselect_item = function($link)
    	{
    		// unique id connects the list item with the select option
    		var unique_id = $link.attr('id');
    		// total items selected
    		var selected_option_count = el.select.find('option:selected').length;									

    	
    		// check if we can unselect (i.e. selected items count not less than minimum)
			if (selected_option_count <= options.minimum)
			{
				var error_msg = 'You must have at least ' + options.minimum + ' option';
				
				if (selected_option_count > 1)
				{
					error_msg = error_msg + 's';
				}
				
				error_msg = error_msg + ' selected';
			
				alert(error_msg);
				return false;
			}

			// unselect select tag option
			$('.'+unique_id).removeAttr('selected');
			// unselect item
			$link.removeClass('selected');
			
			return true;
    	}
        
        
	  
	  	// loop through all matched elements
	    this.each(function() 
	    {  
	    	el.container = $(this); // entire container for menu_button, select tag, list, etc
	  		el.select    = select_init();  // select tag
			el.list      = list_init();  // create html list, link with select tag, get list (ul)
			el.button    = button_init(); 	// setup menu button, get menu button
	
			list_item_init();
			
			// handle default selected options
			// set any default options to selected, if provided
        	for (key in options.selected)
        	{
        		var value = options.selected[key];
        	
        		el.list.find('li a[rel="'+value+'"]').each(function()
        		{
        			select_item($(this));
        		});
        	}
			
			button_update();
			
		});	
	 };  
})(jQuery); 
