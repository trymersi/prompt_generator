// Embedded Config untuk menghindari CORS
console.log('🔧 Loading embedded config...');

const embeddedConfig = {
  "themes": [
    {
      "id": "truck_mountain",
      "name": "Truk di Pegunungan",
      "description": "Truk melintasi jalan tanah di pegunungan tropis yang berliku",
      "template": "Sebuah [TRUCK_TYPE] dengan [CARGO_TYPE] dan plat nomor [PLATE_NUMBER] serta tulisan '[WINDSHIELD_TEXT]' di kaca depan sedang melaju [MOVEMENT_STYLE] melalui jalan berliku di pegunungan tropis. [DRIVER_DESCRIPTION] berada di kursi kemudi. Di sekitar jalan terdapat [PEOPLE_DESCRIPTION]. Video diambil dengan [CAMERA_ANGLE]. Pemandangan menunjukkan pepohonan hijau, jalan tanah yang berliku naik turun, dan suasana pedesaan Indonesia yang asri.",
      "category": "transport",
      "tags": ["truck", "mountain", "indonesia", "rural"]
    }
  ],
  "parameters": {
    "truck_mountain": {
      "TRUCK_TYPE": [
        "a small pickup truck",  
        "a medium-sized box truck (truk engkel)",  
        "a yellow dump truck",  
        "a 3-axle cargo truck (tronton)",  
        "a 4-axle heavy-duty truck (trintin)",  
        "a 5-axle cargo truck (trinton)",  
        "a flatbed trailer truck",  
        "a wing box truck"
      ],
      "CARGO_TYPE": [
        "sacks of rice",  
        "crates of vegetables",  
        "construction tools",  
        "timber logs",  
        "bottled water",  
        "fruit baskets",  
        "livestock cages",  
        "industrial machinery"
      ],
      "PLATE_NUMBER": [
        "BM 8124 TC",  
        "B 9981 KYZ",  
        "DK 3412 JF",  
        "AB 3421 CN",  
        "F 8891 XN",  
        "H 7410 VR",  
        "L 2024 AP",  
        "D 5301 KB"
      ],
      "WINDSHIELD_TEXT": [
        "Doa Ibu",  
        "Sahabat Jalan",  
        "Putra Mandiri",  
        "Langit Biru",  
        "Restu Ayah",  
        "Anak Rantau",  
        "Lestari Alam",  
        "Berkah Usaha"
      ],
      "DRIVER_DESCRIPTION": [
        "a young man in a t-shirt and cap",  
        "a middle-aged man wearing a uniform",  
        "a female driver with a hijab",  
        "a man in a tank top",  
        "a calm elderly man",  
        "a delivery worker in a vest"
      ],
      "PEOPLE_DESCRIPTION": [
        "villagers in sarongs and conical hats",  
        "children playing by the roadside",  
        "farmers carrying baskets of produce",  
        "women walking with babies",  
        "local vendors under makeshift stalls",  
        "people waving at the truck"
      ],
      "MOVEMENT_STYLE": [
        "slow and steady",  
        "slipping and struggling",  
        "powerful and confident",  
        "jerky and bouncing",  
        "cautious with occasional stops"
      ],
      "CAMERA_ANGLE": [
        "drone shot from behind",  
        "low angle side tracking shot",  
        "in-cabin POV from the driver",  
        "cinematic front view",  
        "high wide shot showing road curve",  
        "third-person over-the-shoulder"
      ]
    }
  }
};

// Make config globally available
window.embeddedConfig = embeddedConfig;
console.log('✅ Embedded config loaded successfully:', embeddedConfig); 