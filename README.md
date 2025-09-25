# nativrik: Mobile Tengko Badog 🌶️

### Aplikasi Mobile untuk Kedai Wartiyem

nativrik adalah aplikasi mobile untuk **Kedai Wartiyem**, sebuah proyek kedua dari "Tengko Badog" yang bertujuan untuk memudahkan pelanggan dalam memesan makanan tradisional melalui smartphone mereka. Aplikasi ini menyediakan antarmuka yang intuitif dan fungsional, menghubungkan pelanggan langsung ke daftar menu dan keranjang belanja.

![Proyek Berjalan](https://img.shields.io/badge/Status-Aktif-green.svg)
![Dibuat dengan React Native](https://img.shields.io/badge/Teknologi-React%20Native-blue.svg)

---

## ✨ Fitur-Fitur Utama

* **Beranda Interaktif:** Tampilan yang ramah pengguna dengan sapaan personal dan spanduk promo dinamis.
* **Daftar Menu Komprehensif:** Jelajahi seluruh daftar menu yang diambil dari API, lengkap dengan detail makanan.
* **Pencarian & Filter Cepat:** Temukan menu favorit Anda dalam sekejap menggunakan fitur pencarian dan filter berdasarkan kategori.
* **Keranjang Belanja:** Kelola pesanan Anda dengan mudah; tambahkan, kurangi, atau hapus item dari keranjang.
* **Navigasi Intuitif:** Navigasi antar halaman yang mulus ke Beranda, Menu, Keranjang, dan Riwayat Pesanan.
* **Dukungan Chat Langsung:** Hubungi admin secara langsung melalui fitur chat yang terintegrasi (membutuhkan login).

---

## 🛠️ Teknologi yang Digunakan

* **Front-end:**
    * [React Native](https://reactnative.dev/)
    * [React Navigation](https://reactnavigation.org/)
    * [Axios](https://axios-http.com/) (untuk permintaan API)
    * [react-native-vector-icons](https://github.com/oblador/react-native-vector-icons)

* **Back-end:**
    * API RESTful yang dikembangkan dengan Node.js dan Express.js.

---

## 🚀 Instalasi & Menjalankan Proyek

### Prasyarat

Pastikan Anda telah menginstal **Node.js** dan **React Native CLI** secara global. Ikuti panduan [Environment Setup](https://reactnative.dev/docs/environment-setup) resmi dari React Native untuk konfigurasi yang tepat.

### Langkah-langkah

1.  **Kloning Repositori:**
    ```bash
    git clone https://github.com/Bintang1213/nativrik.git
    cd nativrik
    ```

2.  **Instal Dependensi:**
    Jalankan perintah berikut di dalam direktori proyek:
    ```bash
    npm install
    # atau
    yarn install
    ```

3.  **Jalankan Server Metro:**
    Buka terminal baru di root proyek dan jalankan:
    ```bash
    npm start
    # atau
    yarn start
    ```

4.  **Jalankan Aplikasi di Perangkat:**
    Biarkan Metro Bundler tetap berjalan. Buka terminal baru dan jalankan salah satu perintah berikut:
    ```bash
    # Untuk Android
    npm run android