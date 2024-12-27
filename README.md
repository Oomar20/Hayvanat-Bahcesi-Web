# Hayvan Simülasyonu Projesi

Bu proje, JavaScript ve HTML5 Canvas API kullanılarak oluşturulmuş etkileşimli bir hayvan simülasyonudur. Simülasyon, her biri kendine özgü davranışlara ve etkileşimlere sahip çeşitli varlıkları (hayvanlar ve avcılar) içerir. Kullanıcılar, varlıkların başlangıçtaki dağılımını tanımlayabilir, hareketlerini ve etkileşimlerini simüle edebilir ve sonuçları bir kılı üzerinde görüselleştirilebilir.

## Özellikler

-   **Kullanıcı Özelleştirilebilir Ayarlar**:
    
    -   Kullanıcılar, her tür varlık (koyun, aslan, avcı vb.) sayısını girdiler aracılığıyla tanımlayabilir.
        
    -   Performansı sağlamak için maksimum varlık sayısına sınır getirilmiştir.
        
-   **Izgara Tabanlı Harita**:
    
    -   Tuval boyutları pencere boyutuna dinamik olarak uyum sağlar.
        
    -   Varlıklar, ayarlanabilir hücre boyutlarına sahip bir kıl üzerine konumlandırılır ve görüntülenir.
        
-   **Varlıklar**:
    
    -   Çeşitli hayvan türleri (koyun, keçi, aslan, kurt vb.) ve avcılar.
        
    -   Her varlık türü, benzersiz hareket mesafelerine ve etkileşimlere sahiptir.
        
-   **Simüle Edilen Etkileşimler**:
    
    -   Avcılar, belirli bir mesafe içindeki hayvanları avlayabilir.
        
    -   Aslan ve kurt gibi yırtıcılar, belirli bir yakınlıktaki avları avlar.
        
    -   Uygun çiftler arasında belirli koşullar altında çiftleşme gerçekleşir ve yavrular üretilir.
        
-   **Dinamik Görüntüleme**:
    
    -   Varlıklar ikonlarla temsil edilir ve pozisyonları gerçek zamanlı olarak güncellenir.
        
    -   Hareketler ve etkileşimler tuval üzerinde görselleştirilir.
        
-   **Birden Fazla İterasyon Simülasyonu**:
    
    -   Kullanıcılar, belirli bir iterasyon sayısı boyunca simülasyonu çalıştırmak için girdi kontrollerini kullanabilir.
        

## Nasıl Çalışır

1.  **Izgara Başlatma**:
    
    -   Izgara boyutları, tuval boyutuna ve hücre boyutuna göre hesaplanır.
        
2.  **Varlık Kurulumu**:
    
    -   Kullanıcılardan her bir tür varlık sayısını belirtmeleri istenir.
        
    -   Varlıklar, örtüşme olmadığından emin olunarak rastgele bir şekilde ızgara yerleştirilir.
        
3.  **Simülasyon Döngüsü**:
    
    -   Her iterasyon, varlıkların kendi hareket kurallarına göre ızgarayı günceller.
        
    -   Avlanma, avcılık ve çiftleşme gibi etkileşimler her iterasyon sırasında işlenir.
        
4.  **Görüntüleme**:
    
    -   Her güncellemeden sonra ızgaralar ve varlıklar yeniden çizilerek yeni durum görselleştirilir.
        

## Teknik Detaylar

-   **Kullanılan Teknolojiler**:
    
    -   Grid ve varlıkları render etmek için HTML5 Canvas API.
        
    -   Simülasyon mantığı ve kullanıcı etkileşimlerini yönetmek için JavaScript.
        
-   **Varlık Konfigürasyonu**:
    
    -   Her varlık, özniteliklere sahiptir: `src` (ikon kaynağı), `count` (varlık sayısı), `positions` (mevcut grid pozisyonları) ve `moveDistance` (maksimum hareket mesafesi).
        
-   **Kullanıcı Kontrolleri**:
    
    -   Sonraki iterasyonu başlatmak için bir "Simüle Et" butonu.
        
    -   Belirli sayıda iterasyon simüle etmek için bir girdi alanı ve buton.
        

## Nasıl Çalıştırılır

1.  Reposu klonlayın:
    
    ```
    git clone https://github.com/your-username/animal-simulation.git
    ```
    
2.  `index.html` dosyasını herhangi bir modern web tarayıcısında açın.
    
3.  Simülasyonu kurmak için ekrandaki istemleri izleyin.
    
4.  Simülasyonu kontrol etmek ve etkileşimleri görüntülemek için butonları kullanın.
    


    

