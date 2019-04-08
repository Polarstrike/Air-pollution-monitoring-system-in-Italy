<?php
class DataBase
{
  private $nomehost = "anasim.iet.unipi.it";
  private $nomeuser = "Giacomo-MonIQA";
  private $password = "p7H-gDD-Lgv-yu4";
  private $nomedb = "iqamon";
  private $porta = 3306;

  private $attiva = false;

  public function connetti()
  {
   if(!$this->attiva)
   {
		if($connessione = @mysql_connect($this->nomehost,$this->nomeuser,$this->password) or die (mysql_error()))
		{
			$selezione = mysql_select_db($this->nomedb,$connessione) or die (mysql_error());
		}
    }else
	{
        return true;
    }
  }
}
?>
