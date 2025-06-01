// Pengelolaan tema dan parameter
class ThemeManager {
    constructor() {
        // Tema default sebagai fallback
        this.defaultThemes = {
            "themes": [
                {
                    "id": "truck_mountain",
                    "name": "Truk di Pegunungan",
                    "description": "Truk melintasi jalan tanah di pegunungan tropis yang berliku",
                    "category": "transport",
                    "tags": ["transport", "mountain", "truck", "cinematic", "indonesian"],
                    "templateContent": "A [TRUCK_TYPE] with a license plate reading \"[PLATE_NUMBER]\" is slowly climbing a steep dirt road through a lush tropical hillside. The path is narrow, winding, and surrounded by dense green foliage and bamboo fences. Mist hovers in the background over the forested hills. The truck's tires kick up dust and struggle slightly as it ascends. The windshield displays the phrase \"[WINDSHIELD_TEXT]\". The vehicle is loaded with [CARGO_TYPE]. A [DRIVER_DESCRIPTION] is in the driver's seat, focused on the bumpy road. Alongside the road, several [PEOPLE_DESCRIPTION] can be seen. The truck moves in a [MOVEMENT_STYLE] manner, tires occasionally slipping on the uneven ground. Camera follows from a [CAMERA_ANGLE], capturing both the truck and the beautiful, remote tropical scenery."
                },
                {
                    "id": "urban_street",
                    "name": "Jalanan Kota",
                    "description": "Pemandangan jalanan kota yang ramai dengan berbagai aktivitas",
                    "category": "urban",
                    "tags": ["urban", "city", "street", "busy", "modern"],
                    "templateContent": "A bustling [STREET_TYPE] in [CITY_AREA] during [TIME_OF_DAY]. [WEATHER_CONDITION] creates [LIGHTING_EFFECT] across the scene. [PEOPLE_COUNT] [PEOPLE_TYPE] are [PEOPLE_ACTIVITY] along the sidewalks. [VEHICLE_COUNT] [VEHICLE_TYPE] move through the traffic. The camera captures this from a [CAMERA_POSITION], showing [ARCHITECTURAL_STYLE] buildings and [STREET_DETAILS]. [ATMOSPHERE_MODIFIER] adds to the urban ambiance."
                },
                {
                    "id": "fantasy_forest",
                    "name": "Hutan Fantasi",
                    "description": "Hutan magis dengan makhluk-makhluk mistis dan pemandangan yang menawan",
                    "category": "fantasy",
                    "tags": ["fantasy", "forest", "magic", "mystical", "creatures"],
                    "templateContent": "A mystical [FOREST_TYPE] filled with [MAGICAL_ELEMENTS]. [FANTASY_CREATURES] can be seen [CREATURE_ACTIVITY] among the [TREE_DESCRIPTION]. [LIGHTING_TYPE] filters through the canopy, creating [LIGHT_EFFECTS] on the forest floor. A [CHARACTER_TYPE] [CHARACTER_ACTION] through the woodland path. [MAGICAL_PHENOMENA] manifest around them as [ATMOSPHERE_DETAILS] enhance the otherworldly feeling. The scene is captured from [CAMERA_ANGLE] with [VISUAL_STYLE]."
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
                },
                "urban_street": {
                    "STREET_TYPE": [
                        "main boulevard",
                        "busy intersection",
                        "narrow alley",
                        "commercial street",
                        "pedestrian walkway",
                        "highway overpass",
                        "market street",
                        "residential road"
                    ],
                    "CITY_AREA": [
                        "downtown Jakarta",
                        "central business district",
                        "old town quarter",
                        "modern shopping district",
                        "university area",
                        "residential neighborhood",
                        "industrial zone",
                        "cultural district"
                    ],
                    "TIME_OF_DAY": [
                        "early morning rush hour",
                        "bright sunny afternoon",
                        "golden hour evening",
                        "neon-lit night",
                        "misty dawn",
                        "bustling lunch time",
                        "quiet late evening",
                        "rainy afternoon"
                    ],
                    "WEATHER_CONDITION": [
                        "bright sunlight",
                        "light rain",
                        "overcast clouds",
                        "heavy monsoon",
                        "misty humidity",
                        "clear blue sky",
                        "dramatic storm clouds",
                        "gentle breeze"
                    ],
                    "LIGHTING_EFFECT": [
                        "sharp shadows and highlights",
                        "soft diffused lighting",
                        "colorful reflections on wet pavement",
                        "dramatic contrast",
                        "warm golden glow",
                        "cool blue undertones",
                        "vibrant neon reflections",
                        "moody atmospheric lighting"
                    ],
                    "PEOPLE_COUNT": [
                        "dozens of",
                        "hundreds of",
                        "a few",
                        "countless",
                        "small groups of",
                        "crowds of",
                        "scattered",
                        "bustling masses of"
                    ],
                    "PEOPLE_TYPE": [
                        "office workers",
                        "street vendors",
                        "students",
                        "tourists",
                        "local residents",
                        "commuters",
                        "shoppers",
                        "street performers"
                    ],
                    "PEOPLE_ACTIVITY": [
                        "hurrying to work",
                        "shopping at stalls",
                        "waiting for transportation",
                        "socializing and chatting",
                        "taking photos",
                        "eating street food",
                        "crossing the street",
                        "browsing market goods"
                    ],
                    "VEHICLE_COUNT": [
                        "streams of",
                        "occasional",
                        "heavy traffic of",
                        "a parade of",
                        "sporadic",
                        "continuous flow of",
                        "gridlocked",
                        "fast-moving"
                    ],
                    "VEHICLE_TYPE": [
                        "motorbikes and scooters",
                        "cars and taxis",
                        "buses and trucks",
                        "bicycles and rickshaws",
                        "delivery vehicles",
                        "public transportation",
                        "luxury cars",
                        "traditional vehicles"
                    ],
                    "CAMERA_POSITION": [
                        "high aerial drone view",
                        "street-level perspective",
                        "elevated balcony viewpoint",
                        "moving vehicle POV",
                        "pedestrian eye-level",
                        "rooftop overlooking",
                        "low-angle ground shot",
                        "tracking alongside traffic"
                    ],
                    "ARCHITECTURAL_STYLE": [
                        "modern glass and steel",
                        "colonial-era",
                        "traditional Indonesian",
                        "Art Deco",
                        "contemporary mixed-use",
                        "historic brick",
                        "brutalist concrete",
                        "tropical modernist"
                    ],
                    "STREET_DETAILS": [
                        "colorful street art and murals",
                        "busy food carts and vendors",
                        "lush tropical plants",
                        "traditional shop signs",
                        "modern digital billboards",
                        "historic monuments",
                        "covered walkways",
                        "vibrant market stalls"
                    ],
                    "ATMOSPHERE_MODIFIER": [
                        "The humid tropical air",
                        "Sounds of honking and chatter",
                        "Aromatic street food scents",
                        "Urban energy and movement",
                        "Cultural diversity and vibrancy",
                        "Modern city pulse",
                        "Traditional meets contemporary",
                        "Bustling commercial activity"
                    ]
                },
                "fantasy_forest": {
                    "FOREST_TYPE": [
                        "enchanted ancient woodland",
                        "mystical twilight grove",
                        "magical moonlit forest",
                        "ethereal mist-covered trees",
                        "glowing fairy forest",
                        "dark mysterious woodland",
                        "crystal-infused grove",
                        "rainbow-colored magical trees"
                    ],
                    "MAGICAL_ELEMENTS": [
                        "floating glowing orbs",
                        "sparkling fairy dust",
                        "luminescent flowers",
                        "crystal formations",
                        "magical runes on bark",
                        "swirling energy wisps",
                        "enchanted mushroom circles",
                        "shimmering portal stones"
                    ],
                    "FANTASY_CREATURES": [
                        "graceful unicorns",
                        "tiny glowing fairies",
                        "wise ancient tree spirits",
                        "playful forest sprites",
                        "majestic winged pegasus",
                        "mysterious shadow beings",
                        "colorful magical butterflies",
                        "gentle forest dragons"
                    ],
                    "CREATURE_ACTIVITY": [
                        "dancing in circles",
                        "gathering magical berries",
                        "singing melodious songs",
                        "flying between branches",
                        "casting gentle spells",
                        "communicating telepathically",
                        "tending to magical plants",
                        "creating light shows"
                    ],
                    "TREE_DESCRIPTION": [
                        "towering silver-barked giants",
                        "twisted mystical oaks",
                        "glowing crystal willows",
                        "rainbow-leafed maples",
                        "ancient gnarled ents",
                        "delicate flowering cherries",
                        "luminous white birches",
                        "magical fruit-bearing trees"
                    ],
                    "LIGHTING_TYPE": [
                        "soft ethereal moonbeams",
                        "warm golden fairy light",
                        "cool blue magical glow",
                        "rainbow spectrum illumination",
                        "gentle starlight filtering",
                        "mystical aurora borealis",
                        "dancing firefly luminescence",
                        "crystalline prismatic light"
                    ],
                    "LIGHT_EFFECTS": [
                        "dancing shadows and highlights",
                        "sparkling magical particles",
                        "gentle rainbow reflections",
                        "mysterious glowing patterns",
                        "soft dreamy halos",
                        "shimmering light curtains",
                        "pulsing energy waves",
                        "enchanted light spirals"
                    ],
                    "CHARACTER_TYPE": [
                        "young elven ranger",
                        "wise old wizard",
                        "brave human adventurer",
                        "mystical forest guardian",
                        "curious magical student",
                        "noble fairy princess",
                        "skilled druid healer",
                        "wandering magical creature"
                    ],
                    "CHARACTER_ACTION": [
                        "walks carefully",
                        "moves with grace and purpose",
                        "explores with wonder",
                        "searches for magical herbs",
                        "communes with nature spirits",
                        "practices ancient rituals",
                        "follows a mystical calling",
                        "seeks hidden treasures"
                    ],
                    "MAGICAL_PHENOMENA": [
                        "swirling energy portals",
                        "floating magical symbols",
                        "growing crystal formations",
                        "blooming instant flowers",
                        "shifting tree arrangements",
                        "appearing fairy rings",
                        "materializing spirit animals",
                        "glowing mystical pathways"
                    ],
                    "ATMOSPHERE_DETAILS": [
                        "gentle magical melodies",
                        "sweet enchanted fragrances",
                        "soft whispers of ancient wisdom",
                        "feeling of timeless peace",
                        "air thick with magic",
                        "sense of wonder and mystery",
                        "harmonious natural energy",
                        "protective spiritual presence"
                    ],
                    "CAMERA_ANGLE": [
                        "sweeping aerial forest view",
                        "intimate ground-level tracking",
                        "POV through character's eyes",
                        "mystical floating perspective",
                        "low-angle looking up at trees",
                        "circular orbit around clearing",
                        "slow zoom into magical details",
                        "wide establishing forest shot"
                    ],
                    "VISUAL_STYLE": [
                        "dreamlike soft focus",
                        "vibrant saturated colors",
                        "ethereal misty atmosphere",
                        "high fantasy epic feel",
                        "whimsical fairy tale mood",
                        "mystical horror undertones",
                        "bright Disney-like animation",
                        "realistic fantasy cinematography"
                    ]
                }
            },
            "examples": {
                "truck_mountain": [
                    "A flatbed trailer truck with a license plate reading \"L 2024 AP\" is slowly climbing a steep dirt road through a lush tropical hillside. The path is narrow, winding, and surrounded by dense green foliage and bamboo fences. Mist hovers in the background over the forested hills. The truck's tires kick up dust and struggle slightly as it ascends. The windshield displays the phrase \"Putra Mandiri\". The vehicle is loaded with sacks of rice. A young man in a t-shirt and cap is in the driver's seat, focused on the bumpy road. Alongside the road, villagers in sarongs and conical hats can be seen. The truck moves in a slow and steady manner, tires occasionally slipping on the uneven ground. Camera follows from a drone shot from behind, capturing both the truck and the beautiful, remote tropical scenery.",
                    "A yellow dump truck with a license plate reading \"F 8891 XN\" is slowly climbing a steep dirt road through a lush tropical hillside. The path is narrow, winding, and surrounded by dense green foliage and bamboo fences. Mist hovers in the background over the forested hills. The truck's tires kick up dust and struggle slightly as it ascends. The windshield displays the phrase \"Restu Ayah\". The vehicle is loaded with timber logs. A delivery worker in a vest is in the driver's seat, focused on the bumpy road. Alongside the road, farmers carrying baskets of produce can be seen. The truck moves in a slipping and struggling manner, tires occasionally slipping on the uneven ground. Camera follows from a high wide shot showing road curve, capturing both the truck and the beautiful, remote tropical scenery."
                ],
                "urban_street": [
                    "A bustling main boulevard in downtown Jakarta during golden hour evening. Bright sunlight creates warm golden glow across the scene. Hundreds of office workers are hurrying to work along the sidewalks. Heavy traffic of motorbikes and scooters move through the traffic. The camera captures this from a street-level perspective, showing modern glass and steel buildings and colorful street art and murals. The humid tropical air adds to the urban ambiance.",
                    "A busy intersection in central business district during neon-lit night. Light rain creates colorful reflections on wet pavement across the scene. Crowds of commuters are waiting for transportation along the sidewalks. Continuous flow of cars and taxis move through the traffic. The camera captures this from a elevated balcony viewpoint, showing contemporary mixed-use buildings and modern digital billboards. Sounds of honking and chatter adds to the urban ambiance.",
                    "A narrow alley in old town quarter during misty dawn. Overcast clouds creates soft diffused lighting across the scene. Small groups of street vendors are setting up their stalls along the sidewalks. Occasional bicycles and rickshaws move through the traffic. The camera captures this from a pedestrian eye-level, showing colonial-era buildings and traditional shop signs. Traditional meets contemporary adds to the urban ambiance."
                ],
                "fantasy_forest": [
                    "A mystical enchanted ancient woodland filled with floating glowing orbs. Graceful unicorns can be seen dancing in circles among the towering silver-barked giants. Soft ethereal moonbeams filters through the canopy, creating dancing shadows and highlights on the forest floor. A young elven ranger walks carefully through the woodland path. Swirling energy portals manifest around them as gentle magical melodies enhance the otherworldly feeling. The scene is captured from sweeping aerial forest view with dreamlike soft focus.",
                    "A mystical magical moonlit forest filled with sparkling fairy dust. Tiny glowing fairies can be seen flying between branches among the glowing crystal willows. Cool blue magical glow filters through the canopy, creating sparkling magical particles on the forest floor. A wise old wizard moves with grace and purpose through the woodland path. Floating magical symbols manifest around them as sweet enchanted fragrances enhance the otherworldly feeling. The scene is captured from mystical floating perspective with vibrant saturated colors.",
                    "A mystical glowing fairy forest filled with luminescent flowers. Playful forest sprites can be seen casting gentle spells among the rainbow-leafed maples. Warm golden fairy light filters through the canopy, creating gentle rainbow reflections on the forest floor. A curious magical student explores with wonder through the woodland path. Blooming instant flowers manifest around them as feeling of timeless peace enhance the otherworldly feeling. The scene is captured from intimate ground-level tracking with whimsical fairy tale mood."
                ]
            }
        };
        
        // Muat data dari localStorage jika ada, gunakan default jika tidak ada
        this.loadThemes();
    }
    
    // Muat tema dari localStorage
    loadThemes() {
        const savedThemes = localStorage.getItem('promptGeneratorThemes');
        if (savedThemes) {
            this.themesData = JSON.parse(savedThemes);
        } else {
            this.themesData = this.defaultThemes;
            this.saveThemes();
        }
    }
    
    // Simpan tema ke localStorage
    saveThemes(data = null) {
        const dataToSave = data || this.themesData;
        localStorage.setItem('promptGeneratorThemes', JSON.stringify(dataToSave));
        if (!data) {
            // If no data passed, update our internal data too
            this.themesData = dataToSave;
        }
    }
    
    // Dapatkan daftar semua tema
    getAllThemes() {
        return this.themesData.themes;
    }
    
    // Dapatkan informasi tema berdasarkan ID
    getTheme(themeId) {
        return this.themesData.themes.find(theme => theme.id === themeId);
    }
    
    // Dapatkan parameter untuk tema
    getParameters(themeId) {
        return this.themesData.parameters[themeId] || {};
    }
    
    // Dapatkan contoh prompt untuk tema
    getExamples(themeId) {
        return this.themesData.examples[themeId] || [];
    }
    
    // Dapatkan template untuk tema
    getTemplate(themeId) {
        const theme = this.getTheme(themeId);
        return theme ? theme.templateContent : null;
    }
    
    getNegativePrompt(themeId) {
        const theme = this.getTheme(themeId);
        return theme ? (theme.negativePrompt || '') : '';
    }

    setNegativePrompt(themeId, negativePrompt) {
        const data = this.loadThemes();
        const theme = data.themes.find(t => t.id === themeId);
        
        if (!theme) {
            throw new Error(`Tema dengan ID ${themeId} tidak ditemukan`);
        }
        
        theme.negativePrompt = negativePrompt;
        this.saveThemes(data);
        return true;
    }
    
    // Tambah tema baru
    addTheme(theme, parameters, examples = []) {
        // Validasi tema
        if (!this.validateTheme(theme)) {
            throw new Error('Data tema tidak valid');
        }

        const data = this.loadThemes();

        // Periksa apakah ID sudah ada
        if (data.themes.find(t => t.id === theme.id)) {
            throw new Error(`Tema dengan ID '${theme.id}' sudah ada`);
        }

        // Set default untuk field yang tidak ada
        theme.category = theme.category || 'uncategorized';
        theme.tags = theme.tags || [];
        theme.negativePrompt = theme.negativePrompt || '';

        // Tambahkan tema
        data.themes.push(theme);

        // Tambahkan parameter jika ada
        if (parameters) {
            data.parameters[theme.id] = parameters;
        }

        // Tambahkan contoh jika ada
        if (examples && examples.length > 0) {
            data.examples[theme.id] = examples;
        }

        this.saveThemes(data);
        return true;
    }
    
    // Perbarui tema yang ada
    updateTheme(themeId, themeData) {
        const themeIndex = this.themesData.themes.findIndex(t => t.id === themeId);
        
        if (themeIndex === -1) {
            throw new Error('Tema tidak ditemukan');
        }
        
        // Perbarui tema yang ada
        this.themesData.themes[themeIndex] = {
            ...this.themesData.themes[themeIndex],
            ...themeData
        };
        
        // Simpan perubahan
        this.saveThemes();
    }
    
    // Perbarui parameter untuk tema
    updateParameters(themeId, parameters) {
        // Pastikan tema ada
        if (!this.themesData.themes.some(t => t.id === themeId)) {
            throw new Error('Tema tidak ditemukan');
        }
        
        // Perbarui parameter
        this.themesData.parameters[themeId] = parameters;
        
        // Simpan perubahan
        this.saveThemes();
    }
    
    // Tambah parameter baru ke tema
    addParameter(themeId, paramName, paramValues) {
        // Pastikan tema ada
        if (!this.themesData.themes.some(t => t.id === themeId)) {
            throw new Error('Tema tidak ditemukan');
        }
        
        // Pastikan parameter ada
        if (!this.themesData.parameters[themeId]) {
            this.themesData.parameters[themeId] = {};
        }
        
        // Tambahkan parameter baru
        this.themesData.parameters[themeId][paramName] = paramValues;
        
        // Simpan perubahan
        this.saveThemes();
    }
    
    // Tambah nilai baru ke parameter yang ada
    addParameterValue(themeId, paramName, paramValue) {
        // Pastikan tema ada
        if (!this.themesData.themes.some(t => t.id === themeId)) {
            throw new Error('Tema tidak ditemukan');
        }
        
        // Pastikan parameter ada
        if (!this.themesData.parameters[themeId] || 
            !this.themesData.parameters[themeId][paramName]) {
            throw new Error('Parameter tidak ditemukan');
        }
        
        // Tambahkan nilai baru ke parameter
        this.themesData.parameters[themeId][paramName].push(paramValue);
        
        // Simpan perubahan
        this.saveThemes();
    }
    
    // Hapus nilai dari parameter
    removeParameterValue(themeId, paramName, paramValue) {
        // Pastikan tema ada
        if (!this.themesData.themes.some(t => t.id === themeId)) {
            throw new Error('Tema tidak ditemukan');
        }
        
        // Pastikan parameter ada
        if (!this.themesData.parameters[themeId] || 
            !this.themesData.parameters[themeId][paramName]) {
            throw new Error('Parameter tidak ditemukan');
        }
        
        // Hapus nilai dari parameter
        const index = this.themesData.parameters[themeId][paramName].indexOf(paramValue);
        if (index !== -1) {
            this.themesData.parameters[themeId][paramName].splice(index, 1);
        }
        
        // Simpan perubahan
        this.saveThemes();
    }
    
    // Hapus parameter dari tema
    removeParameter(themeId, paramName) {
        // Pastikan tema ada
        if (!this.themesData.themes.some(t => t.id === themeId)) {
            throw new Error('Tema tidak ditemukan');
        }
        
        // Pastikan parameter ada
        if (!this.themesData.parameters[themeId]) {
            return; // Tidak ada parameter untuk tema ini
        }
        
        // Hapus parameter
        delete this.themesData.parameters[themeId][paramName];
        
        // Simpan perubahan
        this.saveThemes();
    }
    
    // Tambah contoh prompt ke tema
    addExample(themeId, exampleText) {
        // Pastikan tema ada
        if (!this.themesData.themes.some(t => t.id === themeId)) {
            throw new Error('Tema tidak ditemukan');
        }
        
        // Pastikan ada array contoh untuk tema ini
        if (!this.themesData.examples[themeId]) {
            this.themesData.examples[themeId] = [];
        }
        
        // Tambahkan contoh
        this.themesData.examples[themeId].push(exampleText);
        
        // Simpan perubahan
        this.saveThemes();
    }
    
    // Hapus contoh prompt dari tema
    removeExample(themeId, exampleIndex) {
        // Pastikan tema ada
        if (!this.themesData.themes.some(t => t.id === themeId)) {
            throw new Error('Tema tidak ditemukan');
        }
        
        // Pastikan ada array contoh untuk tema ini
        if (!this.themesData.examples[themeId]) {
            return; // Tidak ada contoh untuk tema ini
        }
        
        // Pastikan index valid
        if (exampleIndex >= 0 && exampleIndex < this.themesData.examples[themeId].length) {
            // Hapus contoh
            this.themesData.examples[themeId].splice(exampleIndex, 1);
            
            // Simpan perubahan
            this.saveThemes();
        }
    }
    
    // Perbarui contoh prompt
    updateExample(themeId, exampleIndex, exampleText) {
        // Pastikan tema ada
        if (!this.themesData.themes.some(t => t.id === themeId)) {
            throw new Error('Tema tidak ditemukan');
        }
        
        // Pastikan ada array contoh untuk tema ini
        if (!this.themesData.examples[themeId]) {
            return; // Tidak ada contoh untuk tema ini
        }
        
        // Pastikan index valid
        if (exampleIndex >= 0 && exampleIndex < this.themesData.examples[themeId].length) {
            // Perbarui contoh
            this.themesData.examples[themeId][exampleIndex] = exampleText;
            
            // Simpan perubahan
            this.saveThemes();
        }
    }
    
    // Hapus tema
    removeTheme(themeId) {
        // Cari index tema
        const themeIndex = this.themesData.themes.findIndex(t => t.id === themeId);
        
        if (themeIndex === -1) {
            throw new Error('Tema tidak ditemukan');
        }
        
        // Hapus tema
        this.themesData.themes.splice(themeIndex, 1);
        
        // Hapus parameter tema
        delete this.themesData.parameters[themeId];
        
        // Hapus contoh tema
        delete this.themesData.examples[themeId];
        
        // Simpan perubahan
        this.saveThemes();
    }
    
    // Reset semua data ke default
    resetToDefault() {
        this.themesData = this.defaultThemes;
        this.saveThemes();
    }
    
    // Export data tema ke file JSON
    exportThemes() {
        const dataStr = JSON.stringify(this.themesData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'prompt_generator_themes.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    // Import data tema dari file JSON
    async importThemes(fileInput) {
        return new Promise((resolve, reject) => {
            const file = fileInput.files[0];
            if (!file) {
                reject(new Error('Tidak ada file yang dipilih'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    // Validasi data
                    if (!importedData.themes || !importedData.parameters || !importedData.examples) {
                        reject(new Error('Format file tidak valid'));
                        return;
                    }
                    
                    // Gabungkan dengan data yang ada atau ganti seluruhnya
                    this.themesData = importedData;
                    this.saveThemes();
                    
                    resolve();
                } catch (error) {
                    reject(new Error('Gagal memproses file: ' + error.message));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Gagal membaca file'));
            };
            
            reader.readAsText(file);
        });
    }

    // Search themes by query and category
    searchThemes(query = '', category = '') {
        return this.themesData.themes.filter(theme => {
            const matchesQuery = !query || 
                theme.name.toLowerCase().includes(query.toLowerCase()) ||
                theme.description.toLowerCase().includes(query.toLowerCase()) ||
                (theme.tags && theme.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())));
            
            const matchesCategory = !category || theme.category === category;
            
            return matchesQuery && matchesCategory;
        });
    }

    // Get themes by category
    getThemesByCategory(category) {
        return this.themesData.themes.filter(theme => theme.category === category);
    }

    // Get all categories
    getCategories() {
        const categories = [...new Set(this.themesData.themes.map(theme => theme.category).filter(Boolean))];
        return categories.sort();
    }

    // Get all tags
    getAllTags() {
        const allTags = this.themesData.themes.flatMap(theme => theme.tags || []);
        return [...new Set(allTags)].sort();
    }

    // Add tag to theme
    addTagToTheme(themeId, tag) {
        const theme = this.getTheme(themeId);
        if (!theme) {
            throw new Error('Tema tidak ditemukan');
        }
        
        if (!theme.tags) {
            theme.tags = [];
        }
        
        if (!theme.tags.includes(tag)) {
            theme.tags.push(tag);
            theme.updatedAt = new Date().toISOString();
            this.saveThemes();
        }
    }

    // Remove tag from theme
    removeTagFromTheme(themeId, tag) {
        const theme = this.getTheme(themeId);
        if (!theme) {
            throw new Error('Tema tidak ditemukan');
        }
        
        if (theme.tags) {
            theme.tags = theme.tags.filter(t => t !== tag);
            theme.updatedAt = new Date().toISOString();
            this.saveThemes();
        }
    }

    // Get theme statistics
    getThemeStats() {
        const themes = this.themesData.themes;
        const categories = this.getCategories();
        const tags = this.getAllTags();
        
        return {
            totalThemes: themes.length,
            totalCategories: categories.length,
            totalTags: tags.length,
            categoryCounts: categories.map(cat => ({
                category: cat,
                count: themes.filter(theme => theme.category === cat).length
            })),
            recentThemes: themes
                .filter(theme => theme.createdAt)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
        };
    }

    // Create backup of all data
    createBackup() {
        const backup = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            data: {
                themes: this.themesData.themes,
                parameters: this.themesData.parameters,
                examples: this.themesData.examples
            }
        };
        
        return backup;
    }

    // Restore from backup
    restoreFromBackup(backupData) {
        if (!backupData.data) {
            throw new Error('Format backup tidak valid');
        }
        
        // Validate backup structure
        if (!backupData.data.themes || !backupData.data.parameters || !backupData.data.examples) {
            throw new Error('Data backup tidak lengkap');
        }
        
        // Create a backup of current data first
        const currentBackup = this.createBackup();
        localStorage.setItem('promptGeneratorBackup_' + Date.now(), JSON.stringify(currentBackup));
        
        // Restore data
        this.themesData = {
            themes: backupData.data.themes,
            parameters: backupData.data.parameters,
            examples: backupData.data.examples
        };
        
        this.saveThemes();
        return true;
    }

    // Validate theme data
    validateTheme(theme) {
        const errors = [];
        
        if (!theme.id || typeof theme.id !== 'string') {
            errors.push('ID tema diperlukan dan harus berupa string');
        }
        
        if (!theme.name || typeof theme.name !== 'string') {
            errors.push('Nama tema diperlukan dan harus berupa string');
        }
        
        if (!theme.templateContent || typeof theme.templateContent !== 'string') {
            errors.push('Template content diperlukan dan harus berupa string');
        }
        
        // Check for valid parameter placeholders in template
        const placeholders = theme.templateContent.match(/\[([^\]]+)\]/g);
        if (placeholders) {
            placeholders.forEach(placeholder => {
                const paramName = placeholder.slice(1, -1);
                if (!/^[A-Z_]+$/.test(paramName)) {
                    errors.push(`Parameter placeholder "${placeholder}" harus menggunakan huruf besar dan underscore`);
                }
            });
        }
        
        return errors;
    }

    // Get theme usage statistics
    getThemeUsageStats() {
        // This would integrate with analytics if available
        if (typeof analytics !== 'undefined' && analytics.data) {
            return {
                totalUsage: analytics.data.totalPrompts,
                themeUsage: analytics.data.themeUsage,
                mostUsed: Object.entries(analytics.data.themeUsage)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([id, count]) => ({
                        theme: this.getTheme(id),
                        count
                    }))
            };
        }
        
        return {
            totalUsage: 0,
            themeUsage: {},
            mostUsed: []
        };
    }

    // Duplicate theme
    duplicateTheme(themeId, newId, newName) {
        const originalTheme = this.getTheme(themeId);
        if (!originalTheme) {
            throw new Error('Tema asli tidak ditemukan');
        }
        
        if (this.getTheme(newId)) {
            throw new Error('ID tema baru sudah digunakan');
        }
        
        const duplicatedTheme = {
            ...originalTheme,
            id: newId,
            name: newName || `${originalTheme.name} (Copy)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const parameters = this.getParameters(themeId);
        const examples = this.getExamples(themeId);
        
        return this.addTheme(duplicatedTheme, parameters, [...examples]);
    }

    // Export single theme
    exportTheme(themeId) {
        const theme = this.getTheme(themeId);
        if (!theme) {
            throw new Error('Tema tidak ditemukan');
        }
        
        const exportData = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            theme: theme,
            parameters: this.getParameters(themeId),
            examples: this.getExamples(themeId)
        };
        
        return exportData;
    }

    // Import single theme
    importTheme(importData) {
        if (!importData.theme) {
            throw new Error('Data import tidak valid');
        }
        
        const theme = importData.theme;
        const parameters = importData.parameters || {};
        const examples = importData.examples || [];
        
        // Check if theme ID already exists
        if (this.getTheme(theme.id)) {
            // Generate new ID
            let counter = 1;
            let newId = `${theme.id}_${counter}`;
            while (this.getTheme(newId)) {
                counter++;
                newId = `${theme.id}_${counter}`;
            }
            theme.id = newId;
            theme.name = `${theme.name} (Imported)`;
        }
        
        return this.addTheme(theme, parameters, examples);
    }
}

// Ekspor modul
window.ThemeManager = ThemeManager; 