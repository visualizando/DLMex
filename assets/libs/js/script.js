jQuery(document).ready(function(){
	//setInterval(validarSeccion($(".side-nav-link.active").attr('data-rel')),6000);
	setInterval(ModificarAutomatico,10000);
	$(":input").inputmask();

});


$(window).on('load', function(){
	$(".loadoverlay").fadeOut("fast");
	
});

$(document).on('click', '.side-nav-link', function() {
	var idSeccion = $(this).attr('data-rel');
	cambiarSeccion(idSeccion);
});

$(document).on('click', '.next-button', function() {
	var active = $(".section-container.active").attr('data-order');
	var target = $(".section-container[data-order="+(parseInt(active)+1)+"]").attr('data-id');
	var lastSection = $(".section-container").length;

	if ( target > lastSection ) {
		return true;
	}

	cambiarSeccion(target);
});

$(document).on('click', '.prev-button', function() {
	var active = $(".section-container.active").attr('data-order');
	var target = $(".section-container[data-order="+(parseInt(active)-1)+"]").attr('data-id');

	if ( target < 1 ) {
		return true;
	}

	cambiarSeccion(target);
});

$(document).on('click', '.btn-add', function() {
	var target = $(this).attr("data-target");

	if ( $(target).length < 1 ) {
		return true;
	}

	clonarElemento(target);
});

$(document).on('click', '.checklist-btn', function (e) {
	IdSeccion = $(this).attr("data-rel");
	AbrirModalFaltante(IdSeccion);
	e.preventDefault();
});

$(document).on('click', '.cerrarModal', function (e) {
	$("#ModalQueFalta").removeClass("in").hide();

});

$(document).on('change', '.related', function() {
	$(this).closest('.clonable').find('[data-check-rel]').addClass("out").removeClass("in");
	$("[data-check-rel='"+$(this).attr("id")+"']").removeClass("out").addClass("in");
});

$(document).on('click', '.disableRelated', function() {
	checked = $(this).is(':checked');
	if(checked === true)
		$("[data-check-rel='"+$(this).attr("id")+"']").attr('disabled', true);
	else
		$("[data-check-rel='"+$(this).attr("id")+"']").attr('disabled', false);
});

$(document).on('change', '.multi', function() {
	$(this).closest('.containerMulti').find('[data-check-rel]').addClass("out").removeClass("in");
	$("[data-check-rel='"+$(this).attr("id")+"']").removeClass("out").addClass("in");
});

$(document).on('click', '.save-button', function() {
	validarSeccion($(".side-nav-link.active").attr('data-rel'));
	Modificar();

});

$(document).on('click', '.end-button', function() {
	$(this).closest(".section-container").find('.loadoverlay').fadeIn('fast');
	FinalizarFormulario();
});

var limitCheck = 5;
$("input[name='actividad[]']").on('change', function(evt) {
	if($("input[name='actividad[]']:checked").length > limitCheck) {
		this.checked = false;
	}
});

$("#otraredsoc").on('change', function() {
	optionSelected = $("option:selected", this);
	agregarRedSocial(optionSelected.val());
	optionSelected.remove();
	if($(this).children().length === 1){
		$(this).prev().remove();
		$(this).remove();
	}

});

function agregarRedSocial(value) {
	switch(value) {
		case ("1"):
			 clase = 'instagram';
			 label = 'Usuario de Instagram: ';
			break;
		case ("2"):
			clase = 'linkedin';
			label = 'Usuario de Linkedin: ';
			break;
		case ("3"):
			clase = 'youtube';
			label = 'Canal de Youtube: ';
			break;
	}
	html =`<div class="row">
			<div class="col-md-8">
				<div class="form-group `+clase+`">
					<label for="`+clase+`">`+label+`</label> 
					<input	class="custom-input" type="text" id="`+clase+`" name="`+clase+`" value=""/> 
				</div> 
			</div>
			<div class="col-md-4">
				<div class="checkbox icheck-pomegranate" style="padding-top:15px;">
					<input
					type="checkbox"
					name="notiene`+clase+`"
					id="notiene`+clase+`"
					value="1"
					>
					<label class="icheck-pomegranate" for="notiene`+clase+`" >
						No tiene
					</label>
				</div>
			</div>
		</div>`;
	$("#redesAgregar").append(html);
}
function cambiarSeccion(idSeccion) {
	ModificarAutomatico();

	// Cambia la sección activa
	if (idSeccion == $('.form-sections-nav li:first-child .side-nav-link').attr("data-rel")){
		$(".prev-button").fadeOut("fast");
		$(".next-button").fadeIn("fast");
	} else {
		$(".prev-button").fadeIn("fast");
	}

	if (idSeccion == $('.form-sections-nav li:last-child .side-nav-link').attr("data-rel")){
		$(".prev-button").fadeIn("fast");
		$(".next-button").fadeOut("fast");
	} else {
		$(".next-button").fadeIn("fast");
	}
	
	validarSeccion($(".section-container.active").attr("data-id"));
	$(".section-container.active").removeClass('active');
	$('.section-container[data-id="'+idSeccion+'"]').addClass('active');
	actualizarMenu(idSeccion);	
}

function finalizar() {
	$('.end-button').hide();
	$(".section-container.active").find('.main-section-title').hide();
	setTimeout(	function(){
		$(".section-container.active").find('.content').html('<h1 class="text-center">&#x2714; Sus respuestas fueron enviadas.</h1><p class="text-center">Muchas gracias por completar el formulario.</p>');
		$(".section-container.active").find('.loadoverlay').fadeOut('fast');
	} ,1000);

}

function actualizarMenu(idSeccion) {
	$(".side-nav-link.active").removeClass('active');
	$('.side-nav-link[data-rel="'+idSeccion+'"]').addClass('active');

	// ObtenerDatosSeccion(idSeccion);
}

function validarSeccion(idSeccion) {
	var seccionContainer = $('.section-container[data-id="'+idSeccion+'"]');
	var tipo = "";
	var completa = true;
	seccionContainer.find(".form-group.missing").each(function() { $(this).removeClass("missing"); });

	seccionContainer.find('[aria-required="true"]').each(function() {
		if ($(this).attr("type")) { 
			tipo = $(this).attr("type");
			// si es un input
			if (tipo === "text") { 
				// si es de tipo texto
				if ($(this).val() === "") {
					$(this).closest(".form-group").addClass("missing");
					completa = false;
				}
			} else if (tipo === "radio" || tipo === "checkbox") { 
				// si es radio o checkbox
				if (!validarRadios($(this).attr("name"))) {
					$(this).closest(".form-group").addClass("missing");
					completa = false;
				}
			} else if (tipo === "date") {
				// si es date
				if ($(this).val() === "") {
					$(this).closest(".form-group").addClass("missing");
					completa = false;
				}
			}
		} else {
			if ($(this).val() === "") {
				// quizas es un select, u otro elemento de un form ?
				$(this).closest(".form-group").addClass("missing");
				completa = false;
			}
		}
	});

	/*if (completa)
		$('.side-nav-link[data-rel="'+idSeccion+'"]').removeClass('missing').addClass('completa');
	else
		$('.side-nav-link[data-rel="'+idSeccion+'"]').removeClass('completa').addClass('missing');*/
}

function validarRadios(name) {
	var checked = false;
	$('[name="'+name+'"]').each(function(){
		if ($(this).is(":checked")) { 
			checked = true;
		}
	});
	return checked;
}

function snackBar(msg) {
	$("#snack").html(msg);
	$("#snack").addClass("show");
	setTimeout(function(){ $("#snack").removeClass("show");}, 3000);	
}

function AbrirModalFaltante(IdSeccion)
{
	var param = "accion=3";
	param +="&IdSeccion="+IdSeccion;
	$.blockUI({ message: '<h3><span class="fa fa-spinner fa-spin fa-1x fa-fw"></span>Aguarde un instante...</h3>' });
	$.ajax({
		type: "POST",
		url: "/index_upd.php",
		data: param,
		dataType:"json",
		success: function(msg){
			$("#ModalQueFalta #dataModal").html(msg.html);
			$("#ModalQueFalta").modal("show");

			$.unblockUI();
		}
	});
}



(function($) {
  $.fn.inputFilter = function(inputFilter) {
    return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function() {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      }
    });
  };
}(jQuery));

$(".number-input").inputFilter(function(value) {
  return /^\d*$/.test(value); });
