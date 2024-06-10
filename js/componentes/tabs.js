function iniciarTabs() {
	var $tabsGroup = $('[data-tabs-group]');

	if ($tabsGroup.length) {
		$tabsGroup.on('change.zf.tabs', function(e, tab) {
			$(tab).addClass('seen');
		});

		$tabsGroup.each(function (index, tabs) {
			var $tabs = $(tabs);
			var $tabsTitulo = $tabs.find('[data-tabs]');
			var $tabsConteudo = $tabs.find('[data-tabs-content]');
			var idTabs = 'tabs' + index;

			$tabs.attr('data-tabs-group', idTabs);
			$tabsTitulo.attr('id', idTabs);
			$tabsConteudo.attr('data-tabs-content', idTabs);

			$tabsConteudo.children().each(function (index, conteudo) {
				var idConteudo = idTabs + '-c' + index;
				$(conteudo).attr('id', idConteudo);
				$tabsTitulo.children().eq(index).find('a').attr('href', '#' + idConteudo);
			});

			$tabsTitulo.children().eq(0).addClass('is-active seen');
			$tabsConteudo.children().eq(0).addClass('is-active');

			var $self = $(this);
			setTimeout(function(){
				$self.find(".tabs-title:first a").click();	
			},500);
		});
	}
}
