MATRISE = {
	data: {},
	settings: {},
	
	// application wide functions
	common: {
		init: function() {
			// application-wide
		}
	},
	
	// table editor specific functionality
	tables: {
		init: function() {
			
			// set up variables
			var $addTableBtn = $('.addTable'),
				$addTextBtn  = $('.addText'),
				$saveBtn     = $('.save-btn');
			
			// click event on add table button
			$addTableBtn
				.on('click', function(e) {
					e.preventDefault();
					MATRISE.tables.addTableToSortable();
				});
			
			// click event on add text button
			$addTextBtn
				.on('click', function(e) {
					e.preventDefault();
					MATRISE.tables.addTextToSortable();
				});
			
			// click event on dump button
			$saveBtn
				.on('click', function(e) {
					e.preventDefault();
					$(document).trigger('matrise:updated');
				});
			
			// initialize sortable list
			var $sortable = MATRISE.tables.sortable();
			
			// loop sortable and find each element
			$sortable
				.find('li')
					.each(function(i) {
						
						var $el = $(this);
						
						// if element is table
						if ($el.data('type') == 'table')
							MATRISE.tables.initTable($el, $.parseJSON($el.find('.data-value').text()));
						
						// if element is text
						else if ($el.data('type') == 'paragraph')
							MATRISE.tables.initText($el);
						
					});
			
			// add save button onclick event
			$(document).on('matrise:updated', function(e) {
				MATRISE.tables.saveData();
			});
		},
		
		// save functions
		saveData: function() {
			
			// save data
			var data = new Array();
			
			// loop all sortable elements
			var $sortable = MATRISE.tables.sortable()
				.find('> li')
					.each(function(i) {
						// cache element
						var $el = $(this);
						
						// if element type is table
						if ($el.data('type') == 'table') {
							
							// get data
							data.push({
								type: $el.data('type'),
								content: $el.find('.table').handsontable('getData')
							});
							
						// if element ype is wysiwyg
						} else if ($el.data('type') == 'paragraph') {
							
							// get data
							data.push({
								type: $el.data('type'),
								content: $el.find('.wysiwyg').redactor().getCode()
							});
						}
					});
			
			// cache form element
			var $form = $('#table-form');
			
			// stringify json data to textfield
			$form
				.find('textarea[name="content"]')
					.val(JSON.stringify(data));
			
			// send form
			$.ajax({
				url: $form.attr('action'),
				type: 'POST',
				data: $form.serialize(),
				dataType: 'json',
				success: function(res) {
					console.log(res);
					if (res.status == 'OK')
						MATRISE.tables.showSaveFeedback(res.message, 'success');
					else
						MATRISE.tables.showSaveFeedback('Det oppstod en feil!', 'error')
				}
			});
			
		},
		
		// update feedback from saving
		showSaveFeedback: function(message, status) {
			// cache element
			$container = $('.save-feedback');
			
			// add text and class
			$container
				.text(message)
				.removeAttr('class')
				.addClass(status)
				.show();
			
			// hide on timeout (6 secs)
			setTimeout(function() {
				$container.fadeOut();
			}, 6000);
		},
		
		// initialize and return sortable list
		sortable: function() {
			// set sortable element
			var $sortable = $('#sortable');
			
			// initialize sortable list
			$sortable
				.sortable({
					axis: 'y',
					handle: '.drag-handle',
					cursor: 'move',
					update: function(event, ui) {
						$(document).trigger('matrise:updated');
					}
				});
			
			// return sortable element
			return $sortable;
		},
		
		// create control handlers
		controlHandlers: function() {
			// create wrapper
			var $el = $('<div />')
				.attr('class', 'control-wrapper');
			
			// append drag handle
			$el.append(
				$('<div />')
					.attr('class', 'drag-handle')
					.text('Flytt')
			);
			
			// append delete handle
			$el.append(
				$('<a />')
					.attr('href', '#')
					.attr('class', 'remove-handle')
					.html('&times;')
					.on('click', function(e) {
						// get delete confirmation
						if (confirm('Er du sikker på at du vil slette denne?'))
						{
							// remove element
							$(this).parents('li').remove();
							
							// save changes
							$(document).trigger('matrise:updated');
						}
					})
			);
			
			return $el;
		},
		
		// add table to sortable element
		addTableToSortable: function() {
			
			$('#newTable').modal('show');
			
			$('#append-table').on('submit', function(e) {
				e.preventDefault();
				
				// submit form
				
				
			});
			
			/*
			// create element
			var $el = $('<li />');
			
			// add attributes to element
			$el
				.data('type', 'table')
				.html('<div class="well">' +
					'<div class="data-value hide"></div>' +
					'<div class="table"></div>' +
				'</div>');
			
			// append element to sortable list
			$el.appendTo(MATRISE.tables.sortable());
			
			// add highlight effect
			MATRISE.tables.showHighlightEffect($el);
			
			// init table
			MATRISE.tables.initTable($el, [Array(5)]);
			*/
		},
		
		// add wysiwyg to sortable element
		addTextToSortable: function() {
			// create element
			var $el = $('<li />');
			
			// add attributes
			$el
				.data('type', 'paragraph')
				.html('<div class="well">' +
					'<textarea class="wysiwyg"></textarea>' +
				'</div>');
			
			// append element to sortable list
			$el.appendTo(MATRISE.tables.sortable());
			
			// add highlight effect
			MATRISE.tables.showHighlightEffect($el);
			
			// init wysiwyg
			MATRISE.tables.initText($el);
			
			// enable save button
			// $('#save').removeAttr('disabled');
		},
		
		// initialize table
		initTable: function($el, data) {
			
			/*
			var data = [
				[{
					value: 'A'
				},{
					value: 'B',
					style: {
						class: 'highlight'
					}
				},{
					value: 'C'
				}],[{
					value: '1'
				},{
					value: '2',
					style: {
						class: 'highlight'
					}
				},{
					value: '3'
				}]
			];
			*/
			
			$el
				.prepend(MATRISE.tables.controlHandlers())
				.find('.table')
					.each(function(i) {
					var $table = $(this);
					
					$table
						.attr('id', 'id-' + (new Date()).getTime())
						.handsontable({
							// data: MATRISE.tables.prepareData(data),
							data: data,
							colHeaders: true,
							rowHeaders: true,
							fillHandle: true,
							// contextMenu: true,
							contextMenu: {
								callback: function(key, options) {
									if (key === 'highlight')
									{
										// console.log('highlight column');
										// console.log($table.handsontable('getSelected')[0] + 'x' + $table.handsontable('getSelected')[1]);
										
										var selected = {
											row: $table.handsontable('getSelected')[0],
											col: $table.handsontable('getSelected')[1]
										};
										
										// console.log(selected);
										
										var tableData = $table.handsontable('getData');
										
										console.log(tableData);
										// console.log(tableData[selected.row][selected.col]);
										
									}
								},
								items: {
									'highlight': {
										name: 'Highlight column'
									}
								}
							},
							manualColumnResize: true,
							startRows: 0,
							startCols: 0,
							// stretchH: 'all',
							onChange: function(changes, source) {
								// enable save button
								// $('#save').removeAttr('disabled');
								
								// TODO: parse content of cell and set correct options
								// console.log('parse');
							},
							onSelectionByProp: function(r, p, r2, p2) {
								// console.log(r + 'x' + p);
							}
						});
				});
			
			// MATRISE.tables.prepareData();
		},
		
		prepareData: function(data) {
			
			
			
			var tableData = [];
			
			for (i = 0; i < data.length; i++)
			{
				var row = [];
				
				for (j = 0; j < data[i].length; j++)
				{
					// row.push(data[i][j].value);
					var cell = data[i][j];
					
					row.push(cell.value);
					
					// console.log(cell.value);
				}
				
				tableData.push(row);
			}
			
			return tableData;
		},
		
		// initialize wysiwyg editor
		initText: function($el) {
			$el
				.prepend(MATRISE.tables.controlHandlers())
				.find('.wysiwyg')
					.redactor();
		},
		
		// show highlight effect on newly added elements
		showHighlightEffect: function(el) {
			el.find('.well').effect('highlight', { color: '#ffff99' }, 2000);
		}
	},
	
	// preview functionality
	previewTable: {
		// init functionality
		init: function() {
			
			var $container = $('#wrapper'),
				$content   = $('<div/>').attr('id', 'preview-content'),
				numCols,
				emptyCells;
			
			// loop through dataset
			for (var i = 0; i < data.length; i++)
			{
				// skip loop if data is undefined
				// if (typeof data[i] == 'undefined') continue;
				
				// set content variable for this object
				var content = data[i].content;
				
				// if content type is paragraph
				if (data[i].type == 'paragraph')
				{
					// trim text content
					var textContent = $.trim(content);
					
					// append text to container
					$content.append(textContent);
				}
				// if content type is table
				else if (data[i].type == 'table')
				{
					// set table object
					var $table = $('<table />');
					
					// keep count of the number of columns
					numCols = 0;
					
					// loop through each row
					for (var rowIndex = 0; rowIndex < content.length; rowIndex++)
					{
						// set new row object
						var $row = $('<tr />');
						
						// keep track of empty cells so that we can remove them
						emptyCells = 0;
						
						// loop through cells in row
						for (var cellIndex = 0; cellIndex < content[rowIndex].length; cellIndex++)
						{
							// increase the column count if this row has more columns
							numCols = (numCols < content[rowIndex].length ? content[rowIndex].length : numCols);
							
							// set new cell object
							var $cell = $('<td />');
							
							// get trimmed cell content
							var cellContent = $.trim(content[rowIndex][cellIndex]);
							
							// if cell content is empty, fill with no break space
							if (!cellContent) cellContent = '&nbsp;';
							
							/*
							if (cellContent == '')
							{
								// console.log(i + ': ' + rowIndex + ':' + cellIndex);
								emptyCells++;
							}
							*/
							
							// append content to cell
							$cell.html(cellContent);
							
							// append cell to row
							$row.append($cell);
						}
						
						/*
						if (emptyCells !== content[rowIndex].length)
						{
						}
						*/
						
						// append row to table
						$table.append($row);
					}
					
					// append table to dom
					$content.append($table);
					
					// console.log(emptyCells);
				}
			}
			
			// append content to container
			$container.append($content);
		}
	}
};


// http://viget.com/inspire/extending-paul-irishs-comprehensive-dom-ready-execution
UTIL = {
	exec: function(controller, action) {
		var ns = MATRISE,
			action = (action === undefined) ? 'init' : action;
		
		if (controller !== '' && ns[controller] && typeof ns[controller][action] == 'function')
			ns[controller][action]();
	},
	init: function() {
		var body       = document.body,
			controller = body.getAttribute('data-controller'),
			action     = body.getAttribute('data-action');
		
		UTIL.exec('common');
		UTIL.exec(controller);
		UTIL.exec(controller, action);
	}
}

$(document).ready(UTIL.init);