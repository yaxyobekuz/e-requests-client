import fileImg from "../images/3d-file.png";
import spannerImg from "../images/3d-spanner.png";
import settingsImg from "../images/3d-settings.png";

const stepsData = [
  {
    number: 1,
    title: "Murojaatlarni boshqarish",
    description: `Platformada murojaatlaringizni yuborish, boshqarish va holatini kuzatishingiz mumkin.`,
    image: fileImg,
    button: "Boshlash",
  },
  {
    number: 2,
    title: "Servislar bo'limi",
    description: `Kerakli xizmatlarni toping, servislar bo'yicha ma'lumotlarni ko'ring va ariza yuboring.`,
    image: settingsImg,
    button: "Keyingi",
  },
  {
    number: 3,
    title: "Mahalla Servis Kompaniyasi",
    description: `Mahalla servis kompaniyasi bilan bog'liq murojaatlar va xizmatlarni bitta joyda yuriting.`,
    image: spannerImg,
    button: "Yakunlash",
  },
];

export default stepsData;
