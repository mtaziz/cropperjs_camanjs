// http://mafestival.be/blicsm/plugins/cropper-master/docs/


	window.isCrop = false;
	window.arrActions = [];
	$(document).ready(function(){
		// caman===============================================================================================
		var canvas = document.getElementById('canvas');

		/* Enable Cross Origin Image Editing */
		var ctx = canvas.getContext('2d');
		var img = new Image();
		img.crossOrigin = '';
		img.src = $('#picture').attr('src');

		img.onload = function () {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0, img.width, img.height);
		}

		var $reset = $('#resetbtn');
		var $pinhole = $('#pinholebtn');

		/* As soon as slider value changes call applyFilters */
		$('input[type=range]').change(applyFilters);

		function applyFilters() {
			if (window.isCrop == true) {
				DestroyCrop();
			}
			var bright = parseInt($('#brightness').val());

			Caman('#canvas', img, function () {
				this.revert(false);
				this.brightness(bright);
				$('.loading').html('Loading brightness...');
				this.render(function () {
					if (window.isCrop == true) {
						StartCrop();
					}
					$('.loading').html('Done!')
					setTimeout(function () { $('.loading').html('') }, 1500);
				});
			});
		}

		$reset.on('click', function (e) {
			$('input[type=range]').val(0);

			Caman('#canvas', img, function () {
				this.revert(false);
				this.render();
				DestroyCrop();
				window.isCrop = false;
				// window.times = 0;
				window.arrActions = [];
			});
		});

		
		/* In built filters */  /* click and pull for range on input element */
		$pinhole.on('click', function (e) {

			if (window.isCrop == true) {
				DestroyCrop();
			}
			Caman('#canvas', img, function () {
				// DestroyCrop();
				this.pinhole();
				$('.loading').html('Loading sharpen...');
				this.render(function () {
					if (window.isCrop == true) {
						StartCrop();
					}
					$('.loading').html('Done!')
					setTimeout(function () { $('.loading').html('') }, 1500);
				});
			});
		});


		//end caman===============================================================================================


		$('#actionEdit').on('click', function () {
			$('#myModalCanvas').modal('show');
		})

		//check modal hide -> destroy crop and revert canmanjs
		$('#myModalCanvas').on('hidden.bs.modal', function (e) {
			$('input[type=range]').val(0);

			Caman('#canvas', img, function () {
				this.revert(false);
				this.render();
				DestroyCrop();
				window.isCrop = false;
			});
		})

		var console = window.console || { log: function () { } };
		var $imageCanvas = $('#canvas');
		var originalImageURL = $('#picture').attr('src');
		var uploadedImageName = 'cropped.jpg';
		var uploadedImageType = 'image/jpeg';
		var uploadedImageURL;

		var options = {
			viewMode: 1,
			aspectRatio:4 / 3,
			minContainerWidth: 500,
			minContainerHeight: 300,
		};

		function StartCrop() {
			window.isCrop = true;
			$imageCanvas.cropper(options);
		}
		function DestroyCrop() {
			
			// window.times = 0;
			window.arrActions = [];
			
			$imageCanvas.cropper('destroy');
			console.log('destroy')
		}
		
		//click ratio 4/3, 16/9...
		$('.docs-toggles').on('click', function () {
			StartCrop();

			var e = event || window.event;
			var target = e.target || e.srcElement;
			var cropBoxData;
			var canvasData;
			var isCheckbox;
			var isRadio;
			var cropper = $imageCanvas.data('cropper');
			if (!cropper) {
				return;
			}

			if (target.tagName.toLowerCase() === 'label') {
				target = target.querySelector('input');
			}

			isCheckbox = target.type === 'checkbox';
			isRadio = target.type === 'radio';

			if (isCheckbox || isRadio) {
				if (isCheckbox) {
					options[target.name] = target.checked;
					cropBoxData = cropper.getCropBoxData();
					canvasData = cropper.getCanvasData();

					options.ready = function () {
						// console.log('ready');
						cropper.setCropBoxData(cropBoxData).setCanvasData(canvasData);
					};
				} else {
					options[target.name] = target.value;
					options.ready = function () {
						// console.log('ready');
					};
				}

				// Restart
				DestroyCrop()
				StartCrop()
			}
		});

		window.times = 0;
		$('.docs-buttons').on('click', '[data-method]', function () {
			window.times ++;
			var result;
			if(window.times == 1){
				window.isCrop = true;
				var method = $(this).attr('data-method');
				var option = $(this).attr('data-option');
				$imageCanvas.cropper({
					...options,
					ready: function (e) {
						switch (method) {
							case 'rotate':
								result = this.cropper.rotate(option);
								break;

							case 'scaleX':
								result = this.cropper.scaleX(option);
								$(this).data('option', -data.option);
								break;

							case 'scaleY':
								result = this.cropper.scaleY(option);
								$(this).data('option', -data.option);
								break;
							case 'getCroppedCanvas':
								result = this.cropper.getCroppedCanvas(option);
								if (result) {
									result.id = 'canvasResult';
									// console.log(result)

									if (option == 'save') {
										if (typeof $imageCanvas.toBlob !== "undefined") {
											$imageCanvas.toBlob(function (blob) {
												console.log(blob)
												// send the blob to server etc.
												// var formData = new FormData();

												// formData.append('croppedImage', blob);

												// $.ajax('upload.php', {
												// 	method: "POST",
												// 	data: formData,
												// 	processData: false,
												// 	contentType: false,
												// 	success: function () {
												// 		console.log('Upload success');
												// 		$('#myModalCanvas').modal('hide');
												// 	},
												// 	error: function () {
												// 		console.log('Upload error');
												// 	}
												// });
											}, "image/jpeg", 0.75);
										}
										else if (typeof $imageCanvas.msToBlob !== "undefined") {
											var blob = $imageCanvas.msToBlob()
											// send blob
										}
										else {
											// manually convert Data-URI to Blob (if no polyfill)
										}
									}
								}
								break;
						}
					},
				})
			}else{
				StartCrop();
				var $this = $(this);
				// console.log($this)

				var data = $this.data();
				// console.log(data)

				var cropper = $imageCanvas.data('cropper');
				// console.log(cropper)

				var cropped;
				// console.log('method:',data.method)

				if ($this.prop('disabled') || $this.hasClass('disabled')) {
					return;
				}

				cropped = cropper.cropped;

				if (cropper && data.method) {
					data = $.extend({}, data);
					
					
		
					// console.log(window.arrActions)
					// console.log(data.method, data.option)
					switch (data.method) {
						case 'zoom':
							cropper.crop();
							if (cropped && options.viewMode > 0) {
								setTimeout(() => {
									result = $imageCanvas.cropper(data.method, data.option);
								}, 500);
							}
							window.arrActions.push(result)
							break;

						case 'rotate':
							result = $imageCanvas.cropper(data.method, data.option);
							break;

						case 'scaleX':
							result = $imageCanvas.cropper(data.method, data.option);
							$(this).data('option', -data.option);
							break;

						case 'scaleY':
							result = $imageCanvas.cropper(data.method, data.option);
							$(this).data('option', -data.option);
							break;

						case 'getCroppedCanvas':
							result = $imageCanvas.cropper(data.method, data.option);
							if (result) {
								result.id = 'canvasResult';
								console.log(result)

								if (data.option == 'save') {
									if (typeof $imageCanvas.toBlob !== "undefined") {
										$imageCanvas.toBlob(function (blob) {
											console.log(blob)
											// send the blob to server etc.
											// var formData = new FormData();

											// formData.append('croppedImage', blob);

											// $.ajax('upload.php', {
											// 	method: "POST",
											// 	data: formData,
											// 	processData: false,
											// 	contentType: false,
											// 	success: function () {
											// 		console.log('Upload success');
											// 		$('#myModalCanvas').modal('hide');
											// 	},
											// 	error: function () {
											// 		console.log('Upload error');
											// 	}
											// });
										}, "image/jpeg", 0.75);
									}
									else if (typeof $imageCanvas.msToBlob !== "undefined") {
										var blob = $imageCanvas.msToBlob()
										// send blob
									}
									else {
										// manually convert Data-URI to Blob (if no polyfill)
									}
								}
							}
							break;

						case 'destroy':
							if (uploadedImageURL) {
								URL.revokeObjectURL(uploadedImageURL);
								uploadedImageURL = '';
								$image.attr('src', originalImageURL);
							}
							break;
					}

				
				} else {
					console.log('out scope')
				}
			}

			
			
			
			
			
			

		});
	})


	
