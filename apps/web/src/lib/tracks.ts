interface Track {
	id: number;
	gp_name: string;
	first_gp: string;
	real_lap_record: number;
	country: string;
	location: string;
	track_name: string;
	track_length: number;
}

export const tracks: Track[] = [
	{
		id: 0,
		gp_name: "Australian Grand Prix",
		first_gp: "1996-03-10",
		real_lap_record: 76440, // 1:16.440 by Charles Leclerc in 2022
		country: "AU",
		location: "Melbourne",
		track_name: "Albert Park Circuit",
		track_length: 5278,
	},
	{
		id: 1,
		gp_name: "French Grand Prix",
		first_gp: "1971-07-04",
		real_lap_record: 92740, // 1:32.740 by Sebastian Vettel in 2019
		country: "FR",
		location: "Le Castellet",
		track_name: "Circuit Paul Ricard",
		track_length: 5842,
	},
	{
		id: 2,
		gp_name: "Chinese Grand Prix",
		first_gp: "2004-09-26",
		real_lap_record: 94578, // 1:34.578 by Michael Schumacher in 2004
		country: "CN",
		location: "Shanghai",
		track_name: "Shanghai International Circuit",
		track_length: 5451,
	},
	{
		id: 3,
		gp_name: "Bahrain Grand Prix",
		first_gp: "2004-04-04",
		real_lap_record: 93147, // 1:33.147 by Pedro de la Rosa in 2005
		country: "BH",
		location: "Sakhir",
		track_name: "Bahrain International Circuit",
		track_length: 5412,
	},
	{
		id: 4,
		gp_name: "Spanish Grand Prix",
		first_gp: "1991-09-29",
		real_lap_record: 81667, // 1:21.670 by Max Verstappen in 2021
		country: "ES",
		location: "Montmeló",
		track_name: "Circuit de Barcelona-Catalunya",
		track_length: 4655,
	},
	{
		id: 5,
		gp_name: "Monaco Grand Prix",
		first_gp: "1950-05-21",
		real_lap_record: 72909, // 1:12.909 by Lewis Hamilton in 2021
		country: "MC",
		location: "Monte Carlo",
		track_name: "Circuit de Monaco",
		track_length: 3337,
	},
	{
		id: 6,
		gp_name: "Canadian Grand Prix",
		first_gp: "1978-10-08",
		real_lap_record: 73276, // 1:13.076 by Valtteri Bottas in 2019
		country: "CA",
		location: "Montreal",
		track_name: "Circuit Gilles Villeneuve",
		track_length: 4361,
	},
	{
		id: 7,
		gp_name: "British Grand Prix",
		first_gp: "1950-05-13",
		real_lap_record: 82740, // 1:27.097 by Max Verstappen in 2020
		country: "GB",
		location: "Silverstone",
		track_name: "Silverstone Circuit",
		track_length: 5891,
	},
	{
		id: 8,
		gp_name: "German Grand Prix",
		first_gp: "1970-08-02",
		real_lap_record: 73130, // 1:13.780 by Kimi Räikkönen in 2004
		country: "DE",
		location: "Hockenheim",
		track_name: "Hockenheimring",
		track_length: 4574,
	},
	{
		id: 9,
		gp_name: "Hungarian Grand Prix",
		first_gp: "1986-08-10",
		real_lap_record: 77674, // 1:17.774 by Lewis Hamilton in 2020
		country: "HU",
		location: "Mogyoród",
		track_name: "Hungaroring",
		track_length: 4381,
	},
	{
		id: 10,
		gp_name: "Belgian Grand Prix",
		first_gp: "1950-06-18",
		real_lap_record: 104503, // 1:44.503 by Valtteri Bottas in 2018
		country: "BE",
		location: "Stavelot",
		track_name: "Circuit de Spa-Francorchamps",
		track_length: 7004,
	},
	{
		id: 11,
		gp_name: "Italian Grand Prix",
		first_gp: "1950-09-03",
		real_lap_record: 79119, // 1:19.119 by Lewis Hamilton in 2020
		country: "IT",
		location: "Monza",
		track_name: "Autodromo Nazionale Monza",
		track_length: 5793,
	},
	{
		id: 12,
		gp_name: "Singapore Grand Prix",
		first_gp: "2008-09-28",
		real_lap_record: 101447, // 1:41.447 by Kevin Magnussen in 2018
		country: "SG",
		location: "Singapore",
		track_name: "Marina Bay Street Circuit",
		track_length: 5063,
	},
	{
		id: 13,
		gp_name: "Japanese Grand Prix",
		first_gp: "1987-11-01",
		real_lap_record: 92719, // 1:32.919 by Lewis Hamilton in 2019
		country: "JP",
		location: "Suzuka",
		track_name: "Suzuka International Racing Course",
		track_length: 5807,
	},
	{
		id: 14,
		gp_name: "Abu Dhabi Grand Prix",
		first_gp: "2009-11-01",
		real_lap_record: 94194, // 1:34.194 by Max Verstappen in 2021
		country: "AE",
		location: "Abu Dhabi",
		track_name: "Yas Marina Circuit",
		track_length: 5281,
	},
	{
		id: 15,
		gp_name: "United States Grand Prix",
		first_gp: "2012-11-18",
		real_lap_record: 93763, // 1:36.169 (Charles Leclerc, 2019)
		country: "US",
		location: "Austin",
		track_name: "Circuit of the Americas",
		track_length: 5513,
	},
	{
		id: 16,
		gp_name: "Brazilian Grand Prix",
		first_gp: "1973-02-11",
		real_lap_record: 70077, // 1:10.540 (Valtteri Bottas, 2018)
		country: "BR",
		location: "São Paulo",
		track_name: "Autódromo José Carlos Pace",
		track_length: 4309,
	},
	{
		id: 17,
		gp_name: "Austrian Grand Prix",
		first_gp: "1970-08-16",
		real_lap_record: 64326, // 1:05.619 (Carlos Sainz, 2020)
		country: "AT",
		location: "Spielberg",
		track_name: "Red Bull Ring",
		track_length: 4318,
	},
	{
		id: 18,
		gp_name: "Russian Grand Prix",
		first_gp: "2014-10-12",
		real_lap_record: 95761,
		country: "RU",
		location: "Sochi",
		track_name: "Sochi Autodrom",
		track_length: 2313,
	},
	{
		id: 19,
		gp_name: "Mexico City Grand Prix",
		first_gp: "1962-11-04",
		real_lap_record: 77774,
		country: "MX",
		location: "Mexico City",
		track_name: "Autódromo Hermanos Rodríguez",
		track_length: 4304,
	},
	{
		id: 20,
		gp_name: "Azerbaijan Grand Prix",
		first_gp: "2016-06-19",
		real_lap_record: 103009,
		country: "AZ",
		location: "Baku",
		track_name: "Baku City Circuit",
		track_length: 6003,
	},
	{
		id: 26,
		gp_name: "Dutch Grand Prix",
		first_gp: "1950-07-23",
		real_lap_record: 71097,
		country: "NL",
		location: "Zandvoort",
		track_name: "Circuit Zandvoort",
		track_length: 4259,
	},
	{
		id: 27,
		gp_name: "Emilia Romagna Grand Prix",
		first_gp: "1980-09-14",
		real_lap_record: 75484,
		country: "IT",
		location: "Imola",
		track_name: "Autodromo Internazionale Enzo e Dino Ferrari",
		track_length: 4909,
	},
	{
		id: 28,
		gp_name: "Portugese Grand Prix",
		first_gp: "2020-10-25",
		real_lap_record: 78750,
		country: "PT",
		location: "Portimão",
		track_name: "Autódromo Internacional do Algarve",
		track_length: 4653,
	},
	{
		id: 29,
		gp_name: "Saudi Arabian Grand Prix",
		first_gp: "2021-12-05",
		real_lap_record: 88737, // 1:30.734 (Lewis Hamilton, 2021)
		country: "SA",
		location: "Jeddah",
		track_name: "Jeddah Corniche Circuit",
		track_length: 6174,
	},
	{
		id: 30,
		gp_name: "Miami Grand Prix",
		first_gp: "2022-05-08",
		real_lap_record: 89708,
		country: "US",
		location: "Miami",
		track_name: "Miami International Autodrome",
		track_length: 5412,
	},
	{
		id: 31,
		gp_name: "Las Vegas Grand Prix",
		first_gp: "2023-11-18",
		real_lap_record: 94876,
		country: "US",
		location: "Las Vegas",
		track_name: "Las Vegas Strip Circuit",
		track_length: 6201,
	},
	{
		id: 32,
		gp_name: "Qatar Grand Prix",
		first_gp: "2021-11-21",
		real_lap_record: 82384,
		country: "QA",
		location: "Lusail",
		track_name: "Losail International Circuit",
		track_length: 5419,
	},
];
