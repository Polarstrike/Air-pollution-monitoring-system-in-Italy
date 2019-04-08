

<!DOCTYPE html>
<html>

	<head>

		<title>MONIQA-Monitoraggio dell'Indice di Qualit&agrave; dell'Aria</title>

		<meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width">

		<link rel="shortcut icon" href="images/favicon.png" type="image/x-icon" />

	<!-- leaflet -->
	<link rel="stylesheet" href="leaflet/leaflet.css" />
	<script src="leaflet/leaflet.js"></script>
	<script src="leaflet/leaflet-heat.js"></script>


	<!-- Google Font -->

	<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i,800,800i" rel="stylesheet">

	<!-- CSS -->
		<link rel="stylesheet" type="text/css" href="css/style.css">
		<link rel="stylesheet" type="text/css" href="css/mobile.css">


	<!-- jQuery -->
			<script src="https://code.jquery.com/jquery-1.12.4.js"></script>
		  <link rel="stylesheet" href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">


 <!-- jQuery UI -->
			<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>

 <!-- Google Charts -->
			<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
<!-- files -->

			<script type="text/javascript" src="choro/it-region.js"></script>
			<script src="main.js?random=X"></script>
			<script src="heat.js?random=X"></script>
			<script src="choro.js?random=X"></script>
			<script src="ricerca.js?random=X"></script>
      <script src="pageInit.js"></script>



	</head>

	<body>
		<div id="page-wrapper">
			<div id="side-menu">
				<div class="menu-top">
					<div id="menu-home" class="menu-item" main-content="home-content" title="Home" onClick="swap('home')">
						<div class="menu-icon"></div>
						<div class="menu_text">
						<span class="capital_letter">H</span><span class="menu_text">ome</span>
						</div>
					</div>
					<div id="menu-iqa" class="menu-item" main-content="iqa-content" title="Indice di qualit&#224;" onClick="swap('iqa')">
						<div class="menu-icon"></div>
						<div class="menu_text">
						<span class="capital_letter">I</span><span class="menu_text">ndice di qualit&#224;</span>
					</div>
					</div>
					<div id="menu-sostanze" class="menu-item" main-content="sostanze-content" title="Sostanze" onClick="swap('sostanze')">
						<div class="menu-icon"></div>
						<div class="menu_text">
						<span class="capital_letter">S</span><span class="menu_text">ostanze</span>
					</div>

					</div>
					<div id="menu-mappa" class="menu-item" main-content="mappa-content" title="Mappa" onClick="swap('mappa')">
						<div class="menu-icon"></div>
							<div class="menu_text">
						<span class="capital_letter">M</span><span class="menu_text">appa</span>
						</div>
					</div>

					<div id="menu-heat" class="menu-item" main-content="heat-content" title="Heat" onClick="swap('heat')">
						<div class="menu-icon"></div>
							<div class="menu_text">
						<span class="capital_letter">C</span><span class="menu_text">opertura IQA</span>
						</div>
					</div>
					<div id="menu-choro" class="menu-item" main-content="choro-content" title="Choro" onClick="swap('choro')">
						<div class="menu-icon"></div>
							<div class="menu_text">
						<span class="capital_letter">R</span><span class="menu_text">egioni</span>
						</div>
					</div>
					<div id="menu-ricerca" class="menu-item" main-content="ricerca-content" title="Ricerca" onClick="swap('ricerca')">
						<div class="menu-icon"></div>
							<div class="menu_text">
						<span class="capital_letter">R</span><span class="menu_text">icerca</span>
						</div>
					</div>

				</div>

				<!--LOGHI-->
				<div class="loghi">
					<a href="https://www.unipi.it" target="_blank" class="logo-unipi"></a>
					<a href="https://www.dii.unipi.it/ricerca/item/1334-moniqa-monitoraggio-dell’indice-di-qualità-dell’aria.html"  target="_blank" class="logo-dii"></a>
					<a href="http://www.consorzio-cini.it/index.php/it/laboratori-nazionali/smart-cities"  target="_blank" class="logo-cini"></a>
				</div>
			</div>
			<div id ="main-content">
				<div id="home-content">
				</div>
				<div id="iqa-content">
				</div>
				<div id="sostanze-content">
				</div>
				<div id="mappa-content">
				</div>
				<div id="heat-content">
				</div>
				<div id="choro-content">
				</div>
				<div id="ricerca-content">
				</div>
				<div id="predizione-content"> <!-- codice da controllare -->
				</div>
				<!-- fine codice -->
			</div>
		</div>


 </body>

</html>
