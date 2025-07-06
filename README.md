# 👁️ Oculus – Web Application for a Private Eye Clinic

**Oculus** is a full-stack web application developed for a private eye clinic. It allows patients, doctors, and administrators to manage appointments, access medical history, and view important clinic services. The system is designed with user roles to ensure privacy, efficiency, and clear interaction.

🌐 **Live Website:** [https://oculusklinika.up.railway.app/](https://oculusklinika.up.railway.app/)

---

## 📌 Project Overview

This project aims to digitize the workflow of a private eye clinic by offering a centralized system for scheduling appointments, managing services, viewing information, and maintaining patient medical records.

---

## ⚙️ Tech Stack

- **Frontend:** React
- **Backend:** ASP.NET Core Web API
- **Database:** PostgreSQL
- **Hosting:** Railway (Cloud)

---

## 🔑 User Roles & Functionalities

### 👤 Guest (Unregistered User)
- Browse public content on the website
- View clinic information, doctors, services, and price list
- Read news and reviews
- Register for an account

### 👨‍⚕️ Registered User (Patient)
- Schedule appointments
- View personal medical history
- Submit reviews through an interactive form
- Edit personal profile information
- Apply for a doctor position (by submitting a CV and photo)

### 🩺 Doctor
- View personal appointment schedule
- Edit own profile

### 🛠️ Admin
- Manage service listings (add/update/remove)
- Approve doctor employment requests
- Create and publish clinic news via a form
- Assign appointments to doctors
- Cannot interact directly with patients

---

## 🔐 Data Privacy and Access Control

- Only registered users can book appointments.
- Only patients and their assigned doctors can access medical history.
- Patients cannot see other users' appointments.
- Doctors can only view appointments assigned to them.
- Admin can publish news and manage doctors/services but has no patient data access.

---

## 🧪 How to Use

1. Visit the [Live Site](https://oculusklinika.up.railway.app/)
2. Register or log in depending on your role.
3. Navigate through the system based on available permissions:
   - Patients: book appointments, view history, write reviews.
   - Doctors: check your schedule.
   - Admins: manage services, doctors, and news.

---

## 📄 License

This project is open-source and available under the MIT License. Feel free to use, modify, and share it for educational or development purposes.
