# 🔧 Panduan Debug Parameter Generator

## 📋 Langkah-langkah Debugging:

### **1. Buka Aplikasi & Developer Tools**
- Buka `index.html` di browser
- Tekan **F12** untuk membuka Developer Tools
- Pilih tab **Console**

### **2. Pilih Tema**
- Pilih salah satu tema (misalnya "Truk di Pegunungan")
- Pastikan tema terpilih (ditandai dengan warna berbeda)

### **3. Gunakan Debug Tools**
Scroll ke bagian parameter, akan ada section "🛠️ Debug Tools" dengan 4 tombol:

#### **A. Tombol "🐛 Debug"**
- Klik untuk melihat status parameter
- Akan muncul popup dengan info detail
- Periksa apakah semua parameter ada

#### **B. Tombol "⚡ Auto Test"**
- Klik untuk mengisi parameter otomatis
- Sistem akan pilih opsi pertama untuk semua parameter
- Lalu otomatis akan generate

#### **C. Tombol "⚡ Force Test"**
- Test sederhana dengan template hardcoded
- Jika ini berhasil, masalahnya di template/parameter

#### **D. Tombol "🎲 Random & Generate"**
- Acak parameter lalu langsung generate
- Test apakah randomizer + generator bekerja

### **4. Manual Testing**
- Pilih parameter satu per satu dari dropdown
- Pastikan tidak ada yang "Pilih..." (placeholder)
- Klik "Generate Prompt"
- Perhatikan console log

### **5. Periksa Console Log**
Setelah klik generate, console akan menampilkan:
```
🚀 Starting generatePrompt function...
✅ Current theme: [theme object]
✅ Template content: [template string]
📝 Initial result: [initial template]
✅ Available parameters: [parameter object]
🔍 Processing parameter: PARAM_NAME
📋 Select element found for PARAM_NAME, value: "selected_value"
🔄 Before replacement for [PARAM_NAME]: [before]
✅ After replacement for [PARAM_NAME]: [after]
```

### **6. Identifikasi Masalah**

#### **Jika Console menampilkan:**
- `❌ No current theme` → Tema belum dipilih
- `❌ No template content` → Template tidak ter-load
- `❌ No parameters for theme` → Parameter tidak ter-load
- `❌ Select element not found` → HTML element hilang
- `⚠️ Empty value for PARAM_NAME` → Parameter belum dipilih
- `❌ Unfilled parameters in result` → Template/replacement gagal

### **7. Solusi Berdasarkan Masalah**

#### **A. Tema tidak terpilih:**
```javascript
// Manual select tema di console
selectTheme('truck_mountain');
```

#### **B. Template kosong:**
```javascript
// Cek template content
console.log(templateContent);
// Manual set template
templateContent = "A [TRUCK_TYPE] is driving...";
```

#### **C. Parameter tidak ter-load:**
```javascript
// Cek parameter
console.log(config.parameters);
// Manual refresh
fetchConfig();
```

#### **D. Element tidak ditemukan:**
```javascript
// Cek apakah element ada
document.querySelectorAll('select[data-param]');
// Manual populate
populateParameters();
```

### **8. Test Manual di Console**
Jika semua debug gagal, test manual di console:

```javascript
// Test 1: Simple replacement
let test = "A [TRUCK_TYPE] is driving.";
test = test.replace(/\[TRUCK_TYPE\]/g, "red truck");
console.log(test); // Should show: "A red truck is driving."

// Test 2: Set result manually
document.getElementById('result-prompt').value = "Test berhasil!";

// Test 3: Check if elements exist
console.log(document.getElementById('result-prompt'));
console.log(document.querySelectorAll('select[data-param]'));
```

### **9. Kemungkinan Penyebab Utama**

1. **Parameter dropdown tidak ter-generate** → Periksa `populateParameters()`
2. **Template tidak ter-load** → Periksa `selectTheme()` dan `fetchConfig()`
3. **Selector tidak match** → Periksa `data-param` attribute
4. **JavaScript error** → Periksa console untuk error merah
5. **Timing issue** → Element belum siap saat script jalan

### **10. Quick Fix Commands**

Jalankan di console jika diperlukan:

```javascript
// Force refresh semua
fetchConfig();
selectTheme('truck_mountain');
populateParameters();

// Force select parameter pertama untuk semua
Object.keys(config.parameters[currentTheme.id]).forEach(key => {
    const select = document.querySelector(`select[data-param="${key}"]`);
    if (select) select.selectedIndex = 1; // Skip placeholder
});

// Force generate
generatePrompt();
```

---

## 🎯 Hasil yang Diharapkan

Setelah debugging, parameter harus:
- ✅ Muncul di dropdown
- ✅ Bisa dipilih
- ✅ Berubah hasil generate sesuai pilihan
- ✅ Console log menampilkan proses replacement
- ✅ Textarea result menampilkan prompt yang benar

Jika masih gagal setelah semua langkah, berikan screenshot console log dan pesan error yang muncul!

---

## 🆕 **KHUSUS: Debugging Tema Baru**

### **Masalah: "Prompt yang baru ditambahkan tidak mau terisi parameternya"**

#### **Langkah Cepat:**
1. **Pilih tema yang baru ditambahkan**
2. **Klik tombol "🔍 Debug Tema Baru"** di bagian Debug Tools
3. **Lihat hasil di console dan popup**
4. **Jika ada masalah, klik "🛠️ Perbaiki Parameter"**

#### **Kemungkinan Penyebab & Solusi:**

##### **A. Template tidak memiliki parameter (placeholder)**
**Gejala:** Console menampilkan "Template placeholders: []"
**Solusi:** 
- Template harus menggunakan format `[NAMA_PARAMETER]`
- Contoh: "Sebuah `[KENDARAAN]` melaju di `[JALAN]`"
- Buka Theme Editor → Edit template → Tambahkan placeholder

##### **B. Parameter tidak tersimpan untuk tema baru**
**Gejala:** Console menampilkan "No parameters found for theme"
**Solusi:**
- Klik "🛠️ Perbaiki Parameter" (auto-generate)
- Atau manual: klik "⚙️ Kelola Parameter"

##### **C. Nama parameter tidak cocok dengan template**
**Gejala:** Popup menampilkan "Parameter tidak cocok dengan template"
**Solusi:**
- Template: `[KENDARAAN]` → Parameter harus bernama `KENDARAAN`
- Klik "🛠️ Perbaiki Parameter" untuk auto-fix

##### **D. Template tidak ter-load dengan benar**
**Gejala:** Console menampilkan "Template content: undefined" atau kosong
**Solusi:**
```javascript
// Test manual di console:
templateContent = themeManager.getTemplate(currentTheme.id);
console.log(templateContent);
```

### **Panduan Auto-Fix:**

#### **1. Gunakan Tombol "🛠️ Perbaiki Parameter"**
Tombol ini akan:
- ✅ Scan template untuk placeholder `[PARAMETER]`
- ✅ Generate parameter default berdasarkan nama
- ✅ Simpan parameter ke localStorage
- ✅ Refresh UI

#### **2. Parameter Default yang Di-generate:**
- `[COLOR]` atau `[WARNA]` → merah, biru, hijau, dll
- `[SIZE]` atau `[UKURAN]` → kecil, sedang, besar, dll  
- `[TIME]` atau `[WAKTU]` → pagi, siang, sore, malam
- `[WEATHER]` atau `[CUACA]` → cerah, berawan, hujan, dll
- `[LOCATION]` atau `[LOKASI]` → kota, desa, pegunungan, dll
- Lainnya → pilihan 1, pilihan 2, pilihan 3, dll

### **Test Manual untuk Tema Baru:**

```javascript
// 1. Cek tema saat ini
console.log('Current theme:', currentTheme);

// 2. Cek template
console.log('Template:', templateContent);

// 3. Cek parameter
console.log('Parameters:', config.parameters[currentTheme.id]);

// 4. Cek localStorage
const saved = JSON.parse(localStorage.getItem('promptGeneratorThemes'));
console.log('Saved theme:', saved.themes.find(t => t.id === currentTheme.id));
console.log('Saved params:', saved.parameters[currentTheme.id]);

// 5. Force fix (jika auto-fix gagal)
fixNewThemeParameters();
```

### **Checklist Tema Baru:**
- [ ] Template menggunakan format `[PARAMETER]` 
- [ ] Parameter tersimpan di localStorage
- [ ] Nama parameter cocok dengan template
- [ ] Dropdown parameter muncul di UI
- [ ] Generate prompt berhasil mengganti parameter

--- 