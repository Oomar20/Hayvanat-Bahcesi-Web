window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const simulateButton = document.getElementById('simulateButton');
    const simulateAmountInput = document.getElementById('simulateAmount');
    const simulateAmountButton = document.getElementById('simulateAmountButton');

    // Tuval boyutları pencere boyutuna ayarlanıyor
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - document.getElementById('footer').offsetHeight;

    const cellSize = 50; // Hücre boyutu (piksel cinsinden)
    const cols = Math.floor(canvas.width / cellSize); // Sütun sayısı
    const rows = Math.floor(canvas.height / cellSize); // Satır sayısı

    let currentIteration = 0; // Küresel iterasyon sayacı

    // Varlıkların (hayvanlar ve avcılar) tanımları
    const entities = [
        { src: './assets/icons/sheep.png', count: 0, positions: [], moveDistance: 2 }, // Koyun
        { src: './assets/icons/goat.png', count: 0, positions: [], moveDistance: 2 }, // Keçi
        { src: './assets/icons/hunter.png', count: 0, positions: [], moveDistance: 1 }, // Avcı
        { src: './assets/icons/lion_male.png', count: 0, positions: [], moveDistance: 4 }, // Erkek aslan
        { src: './assets/icons/lion_female.png', count: 0, positions: [], moveDistance: 2 }, // Dişi aslan
        { src: './assets/icons/wolf_male.png', count: 0, positions: [], moveDistance: 3 }, // Erkek kurt
        { src: './assets/icons/wolf_female.png', count: 0, positions: [], moveDistance: 3 }, // Dişi kurt
        { src: './assets/icons/chicken.png', count: 0, positions: [], moveDistance: 1 }, // Tavuk
        { src: './assets/icons/rooster.png', count: 0, positions: [], moveDistance: 1 }, // Horoz
        { src: './assets/icons/cow.png', count: 0, positions: [], moveDistance: 2 }, // İnek
        { src: './assets/icons/bull.png', count: 0, positions: [], moveDistance: 2 }, // Boğa
    ];

    // Grid haritasının tanımı
    let gridMap = Array.from({ length: rows }, () => Array(cols).fill(null));

    // Grid haritasını güncelleme fonksiyonu
    function updateGridMap() {
        gridMap = Array.from({ length: rows }, () => Array(cols).fill(null));
        entities.forEach(entity => {
            entity.positions.forEach(pos => gridMap[pos.row][pos.col] = entity);
        });
    }

    // Hayvan sayısını güncelleme fonksiyonu
    function updateAnimalCount() {
        const totalAnimals = entities.reduce((sum, entity) => sum + entity.positions.length, 0); // Toplam hayvan sayısını hesapla
        const infoBox = document.getElementById('infoBox');
        if (infoBox) {
            infoBox.textContent = `Total Animals: ${totalAnimals}`; // Bilgi kutusuna toplam hayvan sayısını yaz
        }
    }

    // Görselleri önceden yükleme fonksiyonu
    function preloadImages(entities, callback) {
        const totalImages = entities.reduce((sum, e) => sum + e.count, 0); // Toplam yüklenecek görsel sayısı
        let loadedCount = 0;

        entities.forEach(entity => {
            for (let i = 0; i < entity.count; i++) {
                const img = new Image();
                img.src = entity.src; // Görsel kaynağını ayarla
                img.onload = () => {
                    loadedCount++;
                    if (loadedCount === totalImages) callback(); // Tüm görseller yüklendiğinde callback çağır
                };
                img.onerror = () => console.error(`Failed to load image: ${img.src}`); // Yükleme hatası durumunda hata mesajı
            }
        });
    }

    // Grid'i çizme fonksiyonu
    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Tuvali temizle
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const x = i * cellSize; // Hücre X koordinatı
                const y = j * cellSize; // Hücre Y koordinatı
                ctx.strokeStyle = '#ccc'; // Grid rengi
                ctx.strokeRect(x, y, cellSize, cellSize); // Hücre çerçevesini çiz
            }
        }
    }


    function renderIconInCell(imageSrc, col, row) {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            const x = col * cellSize + cellSize * 0.1; // Hücrenin X koordinatı
            const y = row * cellSize + cellSize * 0.1; // Hücrenin Y koordinatı
            const size = cellSize * 0.8; // Görsel boyutu (hücrenin %80'i)
            ctx.drawImage(image, x, y, size, size); // Görseli belirtilen koordinatlara çiz
        };
    }

    function getFirstAvailableCell(baseCol, baseRow, range) {
        // Belirtilen aralıkta ilk boş hücreyi bul
        for (let moveX = -range; moveX <= range; moveX++) {
            for (let moveY = -range; moveY <= range; moveY++) {
                const col = Math.min(Math.max(baseCol + moveX, 0), cols - 1); // Sütun sınırlarını kontrol et
                const row = Math.min(Math.max(baseRow + moveY, 0), rows - 1); // Satır sınırlarını kontrol et
                if (!gridMap[row][col]) return { col, row }; // Eğer hücre boşsa döndür
            }
        }
        return null; // Boş hücre bulunamazsa null döndür
    }

    function placeEntitiesRandomly() {
        // Varlıkları rastgele yerleştir
        entities.forEach(entity => {
            entity.positions = []; // Mevcut pozisyonları sıfırla
            for (let i = 0; i < entity.count; i++) {
                let cell;
                do {
                    // Rastgele bir hücre seç
                    const col = Math.floor(Math.random() * cols);
                    const row = Math.floor(Math.random() * rows);
                    cell = { col, row, lastBredIteration: -10 }; // Hücre pozisyonu ve diğer bilgiler
                } while (gridMap[cell.row][cell.col]); // Hücre doluysa tekrar seç

                gridMap[cell.row][cell.col] = entity; // Grid haritasına varlığı ekle
                entity.positions.push(cell); // Varlık pozisyonlarına ekle
                renderIconInCell(entity.src, cell.col, cell.row); // İkonu hücreye çiz
            }
        });
        updateAnimalCount(); // Toplam hayvan sayısını güncelle
    }

    function promptAnimalDistribution() {
        // Hayvan dağılımını kullanıcıdan alınan bilgilerle ayarla
        const animalPrompts = [
            { entity: 'sheep', text: 'Enter the number of sheep:' }, // Koyun
            { entity: 'goat', text: 'Enter the number of goats:' }, // Keçi
            { entity: 'lion_male', text: 'Enter the number of male lions:' }, // Erkek aslan
            { entity: 'lion_female', text: 'Enter the number of female lions:' }, // Dişi aslan
            { entity: 'wolf_male', text: 'Enter the number of male wolves:' }, // Erkek kurt
            { entity: 'wolf_female', text: 'Enter the number of female wolves:' }, // Dişi kurt
            { entity: 'cow', text: 'Enter the number of cows:' }, // İnek
            { entity: 'bull', text: 'Enter the number of bulls:' }, // Boğa
            { entity: 'chicken', text: 'Enter the number of chickens:' }, // Tavuk
            { entity: 'rooster', text: 'Enter the number of roosters:' }, // Horoz
            { entity: 'hunter', text: 'Enter the number of hunters:' } // Avcı
        ];

        animalPrompts.forEach(promptInfo => {
            const userInput = prompt(promptInfo.text, "0"); // Kullanıcıdan sayı al
            let count = parseInt(userInput, 10); // Kullanıcı girişini tam sayıya çevir

            if (!isNaN(count)) {
                if (count > 40) {
                    // Maksimum sınır
                    alert(`The maximum number of ${promptInfo.entity.replace('_', ' ')} is 40. Setting to 40.`);
                    count = 40;
                } else if (count < 0) {
                    // Negatif sayı kontrolü
                    alert(`The number of ${promptInfo.entity.replace('_', ' ')} cannot be negative. Setting to 0.`);
                    count = 0;
                }
            } else {
                // Geçersiz giriş kontrolü
                alert(`Invalid input for ${promptInfo.entity.replace('_', ' ')}. Using default value of 0.`);
                count = 0;
            }

            const entity = entities.find(e => e.src.includes(promptInfo.entity)); // İlgili varlığı bul
            entity.count = count; // Varlık sayısını güncelle
        });
    }



    function checkHunterHuntsAnimals() {
        const hunterPositions = [];
        const animalPositionsMap = new Map();

        // Avcıları ve hayvanları ayrı listelere ayır
        entities.forEach(entity => {
            if (entity.src.includes('hunter')) {
                hunterPositions.push(...entity.positions); // Avcı pozisyonlarını listeye ekle
            } else if (entity.positions.length > 0) {
                animalPositionsMap.set(entity, [...entity.positions]); // Hayvanların pozisyonlarını haritaya ekle
            }
        });

        // Hayvanların güvenli şekilde kaldırılacak indekslerini sakla
        animalPositionsMap.forEach((positions, entity) => {
            const animalsToRemove = new Set();

            hunterPositions.forEach(hunter => {
                positions.forEach((position, index) => {
                    const distance = Math.abs(hunter.col - position.col) + Math.abs(hunter.row - position.row); // Avcı ile hayvan arasındaki mesafe
                    if (distance <= 8) { // Eğer mesafe 8 veya daha az ise
                        animalsToRemove.add(index); // Hayvanı kaldırmak için işaretle
                    }
                });
            });

            // İşaretlenmiş hayvanları güvenli şekilde kaldır
            entity.positions = positions.filter((_, index) => !animalsToRemove.has(index));
        });

        // Tüm değişikliklerden sonra grid haritasını ve hayvan sayısını güncelle
        updateGridMap();
        updateAnimalCount();
    }

    function checkLionEatsPrey() {
        const lionPositions = [];
        const preyPositionsMap = new Map();

        // Aslanları ve avlarını ayrı listelere ayır
        entities.forEach(entity => {
            if (entity.src.includes('lion')) {
                lionPositions.push(...entity.positions); // Aslan pozisyonlarını listeye ekle
            } else if (
                entity.src.includes('sheep') || // Av grubu: koyun
                entity.src.includes('goat') || // Av grubu: keçi
                entity.src.includes('cow') ||  // Av grubu: inek
                entity.src.includes('bull')    // Av grubu: boğa
            ) {
                preyPositionsMap.set(entity, [...entity.positions]); // Av pozisyonlarını haritaya ekle
            }
        });

        // Avları güvenli şekilde kaldırma işlemi
        preyPositionsMap.forEach((positions, entity) => {
            const preyToRemove = new Set();

            lionPositions.forEach(lion => {
                positions.forEach((position, index) => {
                    const distance = Math.abs(lion.col - position.col) + Math.abs(lion.row - position.row); // Aslan ile av arasındaki mesafe
                    if (distance <= 5) { // Eğer mesafe 5 veya daha az ise
                        preyToRemove.add(index); // Avı kaldırmak için işaretle
                    }
                });
            });

            // İşaretlenmiş avları güvenli şekilde kaldır
            entity.positions = positions.filter((_, index) => !preyToRemove.has(index));
        });

        // Tüm değişikliklerden sonra grid haritasını ve hayvan sayısını güncelle
        updateGridMap();
        updateAnimalCount();
    }


    function checkWolvesHuntPrey() {
        const wolfPositions = [];
        const preyPositionsMap = new Map();

        // Kurtları ve avlarını ayrı listelere ayır
        entities.forEach(entity => {
            if (entity.src.includes('wolf')) {
                wolfPositions.push(...entity.positions); // Kurt pozisyonlarını listeye ekle
            } else if (
                entity.src.includes('chicken') || // Av grubu: tavuk
                entity.src.includes('rooster') || // Av grubu: horoz
                entity.src.includes('sheep') ||   // Av grubu: koyun
                entity.src.includes('goat')       // Av grubu: keçi
            ) {
                preyPositionsMap.set(entity, [...entity.positions]); // Av pozisyonlarını haritaya ekle
            }
        });

        // Avları güvenli şekilde kaldırma işlemi
        preyPositionsMap.forEach((positions, entity) => {
            const preyToRemove = new Set();

            wolfPositions.forEach(wolf => {
                positions.forEach((position, index) => {
                    const distance = Math.abs(wolf.col - position.col) + Math.abs(wolf.row - position.row); // Kurt ile av arasındaki mesafe
                    if (distance <= 4) { // Eğer mesafe 4 veya daha az ise
                        preyToRemove.add(index); // Avı kaldırmak için işaretle
                    }
                });
            });

            // İşaretlenmiş avları güvenli şekilde kaldır
            entity.positions = positions.filter((_, index) => !preyToRemove.has(index));
        });

        // Grid haritasını ve hayvan sayısını güncelle
        updateGridMap();
        updateAnimalCount();
    }

    function checkBreeding() {
        const breedingPairs = [
            { male: 'lion_male', female: 'lion_female', offspringMale: 'lion_male', offspringFemale: 'lion_female' }, // Aslan çifti
            { male: 'wolf_male', female: 'wolf_female', offspringMale: 'wolf_male', offspringFemale: 'wolf_female' }, // Kurt çifti
            { male: 'sheep', female: 'goat', offspringMale: 'sheep', offspringFemale: 'goat' }, // Koyun ve keçi çifti
            { male: 'bull', female: 'cow', offspringMale: 'bull', offspringFemale: 'cow' }, // Boğa ve inek çifti
            { male: 'rooster', female: 'chicken', offspringMale: 'rooster', offspringFemale: 'chicken' } // Horoz ve tavuk çifti
        ];

        breedingPairs.forEach(pair => {
            const maleEntities = entities.find(e => e.src.includes(pair.male)); // Erkek hayvanları bul
            const femaleEntities = entities.find(e => e.src.includes(pair.female)); // Dişi hayvanları bul

            if (maleEntities && femaleEntities) {
                maleEntities.positions.forEach(malePos => {
                    femaleEntities.positions.forEach(femalePos => {
                        const distance = Math.abs(malePos.col - femalePos.col) + Math.abs(malePos.row - femalePos.row); // Erkek ve dişi arasındaki mesafe

                        if (
                            distance <= 3 && // Çiftleşme mesafesi
                            currentIteration - malePos.lastBredIteration >= 1 && // Erkek hayvanın son çiftleşmesinden yeterince zaman geçmiş mi?
                            currentIteration - femalePos.lastBredIteration >= 1 && // Dişi hayvanın son çiftleşmesinden yeterince zaman geçmiş mi?
                            (!malePos.birthIteration || currentIteration - malePos.birthIteration >= 5) && // Yeni doğan hayvan doğurabilecek durumda mı?
                            (!femalePos.birthIteration || currentIteration - femalePos.birthIteration >= 5) // Yeni doğan dişi hayvan doğurabilecek durumda mı?
                        ) {
                            const nearbyCell = getFirstAvailableCell(malePos.col, malePos.row, 1); // Çiftleşme için uygun bir hücre bul
                            if (nearbyCell) {
                                const isMale = Math.random() < 0.5; // Yeni doğacak hayvanın cinsiyetini rastgele belirle
                                const offspringEntity = entities.find(e => e.src.includes(isMale ? pair.offspringMale : pair.offspringFemale));
                                if (offspringEntity) {
                                    gridMap[nearbyCell.row][nearbyCell.col] = offspringEntity; // Yeni hayvanı grid'e ekle
                                    offspringEntity.positions.push({
                                        col: nearbyCell.col,
                                        row: nearbyCell.row,
                                        lastBredIteration: currentIteration,
                                        birthIteration: currentIteration
                                    });
                                    renderIconInCell(offspringEntity.src, nearbyCell.col, nearbyCell.row); // Yeni hayvan ikonunu çiz
                                    malePos.lastBredIteration = currentIteration; // Erkek hayvanın çiftleşme zamanını güncelle
                                    femalePos.lastBredIteration = currentIteration; // Dişi hayvanın çiftleşme zamanını güncelle
                                }
                            } else {
                                // console.log("No free cell for breeding, breeding blocked");
                            }
                        }
                    });
                });
            }
        });
        updateGridMap(); // Grid haritasını güncelle
        updateAnimalCount(); // Hayvan sayısını güncelle
    }

    function moveEntities() {
        currentIteration++; // Mevcut iterasyon sayacını artır
        drawGrid(); // Grid'i yeniden çiz
        const newGridMap = Array.from({ length: rows }, () => Array(cols).fill(null)); // Yeni grid haritası oluştur

        // Her varlık için pozisyon güncelle
        entities.forEach(entity => {
            entity.positions = entity.positions.map(({ col, row, lastBredIteration }) => {
                let newCol = col; // Yeni sütun pozisyonu
                let newRow = row; // Yeni satır pozisyonu
                let validMove = false; // Geçerli hareket olup olmadığını kontrol etmek için

                for (let attempt = 0; attempt < 5; attempt++) { // 5 defaya kadar rastgele hareket dene
                    const moveX = Math.floor(Math.random() * (2 * entity.moveDistance + 1)) - entity.moveDistance; // X ekseni hareketi
                    const moveY = Math.floor(Math.random() * (2 * entity.moveDistance + 1)) - entity.moveDistance; // Y ekseni hareketi
                    const tempCol = Math.min(Math.max(col + moveX, 0), cols - 1); // Yeni sütun sınırlarını kontrol et
                    const tempRow = Math.min(Math.max(row + moveY, 0), rows - 1); // Yeni satır sınırlarını kontrol et

                    if (!gridMap[tempRow][tempCol] && !newGridMap[tempRow][tempCol]) { // Hücre boşsa hareketi yap
                        newCol = tempCol;
                        newRow = tempRow;
                        validMove = true;
                        break;
                    }
                }

                if (!validMove) {
                    // Geçerli bir hareket yoksa pozisyonda kal
                    newCol = col;
                    newRow = row;
                }

                newGridMap[newRow][newCol] = entity; // Yeni pozisyonu grid haritasına ekle
                return { col: newCol, row: newRow, lastBredIteration }; // Pozisyon bilgilerini döndür
            });

            // Varlıkları yeni pozisyonlarında çiz
            entity.positions.forEach(({ col, row }) => renderIconInCell(entity.src, col, row));
        });

        gridMap = newGridMap; // Grid haritasını güncelle
        checkHunterHuntsAnimals(); // Avcıların hayvanları avlamasını kontrol et
        checkLionEatsPrey(); // Aslanların av yemesini kontrol et
        checkWolvesHuntPrey(); // Kurtların avları avlamasını kontrol et
        checkBreeding(); // Hayvanların çiftleşmesini kontrol et
        updateAnimalCount(); // Hayvan sayısını güncelle
    }

    promptAnimalDistribution(); // Hayvan dağılımını kullanıcıdan iste
    preloadImages(entities, () => {
        drawGrid(); // Grid'i çiz
        placeEntitiesRandomly(); // Hayvanları rastgele yerleştir
    });

    simulateButton.addEventListener('click', moveEntities); // Simülasyonu başlatmak için butona tıklamayı dinle
    simulateAmountButton.addEventListener('click', () => {
        const times = parseInt(simulateAmountInput.value, 10); // Kullanıcıdan simülasyon sayısını al
        if (!isNaN(times) && times > 0) { // Geçerli bir sayı kontrolü
            let iteration = 0; // Simülasyon iterasyon sayacı

            function simulateStep() {
                if (iteration < times) { // İstenilen iterasyon sayısına ulaşılmadıysa
                    moveEntities(); // Varlıkları hareket ettir
                    iteration++;
                    setTimeout(simulateStep, 1); // Görsel geri bildirim için isteğe bağlı gecikme
                }
            }

            simulateStep(); // Simülasyon döngüsünü başlat
        } else {
            alert('Please enter a valid number of times to simulate.'); // Geçersiz giriş uyarısı
        }
    });
});    
