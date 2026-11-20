const cities = [
  {
    id: 'moscow', name: 'Москва', where: 'в Москве',
    source: 'https://msk.etagi.com/realty_rent/',
    photo: 'Moscow_City_ZIL_View_(43232173205).jpg', author: 'Alexander Annenkov',
    license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/'
  },
  {
    id: 'petersburg', name: 'Санкт-Петербург', where: 'в Санкт-Петербурге',
    source: 'https://spb.etagi.com/realty_rent/',
    photo: 'Saint_Petersburg_Griboedov_Canal.jpg', author: '.:Ajvol:.',
    license: 'общественное достояние'
  },
  {
    id: 'kazan', name: 'Казань', where: 'в Казани',
    source: 'https://kazan.etagi.com/realty_rent/',
    photo: 'Kazan_Kremlin_exterior_view_08-2016_img1.jpg', author: 'A.Savin, Wikipedia',
    license: 'Free Art License', licenseUrl: 'https://artlibre.org/licence/lal/en/'
  },
  {
    id: 'ekaterinburg', name: 'Екатеринбург', where: 'в Екатеринбурге',
    source: 'https://ekb.etagi.com/realty_rent/',
    photo: 'E-burg_asv2019-05_img08_City_Pond_skyline.jpg', author: 'A.Savin, Wikipedia',
    license: 'Free Art License', licenseUrl: 'https://artlibre.org/licence/lal/en/'
  }
];

const homes = [
  {
    id: 1, city: 'moscow', title: 'Двухкомнатная с большой гостиной', area: 'Хорошёвский район',
    rooms: 2, size: 57, price: 72000, deposit: 72000, fee: 0, pets: true,
    description: 'В гостиной есть место для обеденного стола и рабочего уголка. Спальня отдельная, кухня оборудована духовкой и посудомоечной машиной.'
  },
  {
    id: 2, city: 'petersburg', title: 'Однокомнатная с высокими потолками', area: 'Петроградский район',
    rooms: 1, size: 42, price: 54000, deposit: 54000, fee: 27000, pets: false,
    description: 'Большие окна, отдельная спальня и места для хранения. В соседних кварталах есть магазины, пекарни и остановки транспорта.'
  },
  {
    id: 3, city: 'kazan', title: 'Студия с обеденной зоной', area: 'Вахитовский район',
    rooms: 0, size: 29, price: 36000, deposit: 36000, fee: 0, pets: true,
    description: 'Кухонная зона с варочной панелью и холодильником. Раскладной диван и вместительный шкаф оставляют больше места в комнате.'
  },
  {
    id: 4, city: 'ekaterinburg', title: 'Двухкомнатная для семьи', area: 'Ленинский район',
    rooms: 2, size: 53, price: 46000, deposit: 46000, fee: 0, pets: true,
    description: 'Две комнаты, отдельная кухня и застеклённая лоджия. В прихожей есть шкаф, во дворе — детская площадка.'
  },
  {
    id: 5, city: 'moscow', title: 'Трёхкомнатная с кабинетом', area: 'Даниловский район',
    rooms: 3, size: 81, price: 108000, deposit: 108000, fee: 54000, pets: true,
    description: 'Одна из комнат оборудована как кабинет. В гостиной помещается большой диван, на кухне есть посудомоечная машина.'
  },
  {
    id: 6, city: 'petersburg', title: 'Студия с большой кухонной зоной', area: 'Московский район',
    rooms: 0, size: 26, price: 39000, deposit: 39000, fee: 0, pets: true,
    description: 'Кухня с полным набором техники и удобная прихожая. Окна выходят во двор. В комнате можно разместить небольшой рабочий стол.'
  },
  {
    id: 7, city: 'kazan', title: 'Двухкомнатная рядом с парком', area: 'Ново-Савиновский район',
    rooms: 2, size: 55, price: 49000, deposit: 49000, fee: 24500, pets: false,
    description: 'Изолированные комнаты и лоджия. Кухня с обеденным столом на четверых, в спальне — кровать и шкаф.'
  },
  {
    id: 8, city: 'ekaterinburg', title: 'Светлая студия', area: 'Верх-Исетский район',
    rooms: 0, size: 25, price: 29000, deposit: 29000, fee: 0, pets: false,
    description: 'Компактная квартира с мебелью и стиральной машиной. В комнате два окна, спальная зона отделена от кухни.'
  },
  {
    id: 9, city: 'moscow', title: 'Однокомнатная с отдельной спальней', area: 'Сокольники',
    rooms: 1, size: 38, price: 59000, deposit: 59000, fee: 29500, pets: false,
    description: 'Кровать, высокий шкаф и оборудованная кухня. Рядом есть продуктовые магазины и остановки общественного транспорта.'
  },
  {
    id: 10, city: 'petersburg', title: 'Трёхкомнатная с просторной кухней', area: 'Василеостровский район',
    rooms: 3, size: 74, price: 79000, deposit: 79000, fee: 0, pets: true,
    description: 'Квартира с тремя комнатами и большим обеденным столом. Есть места для хранения и отдельное рабочее место.'
  },
  {
    id: 11, city: 'kazan', title: 'Однокомнатная с лоджией', area: 'Советский район',
    rooms: 1, size: 37, price: 33000, deposit: 33000, fee: 16500, pets: true,
    description: 'Квартира с застеклённой лоджией и отдельной кухней. Есть духовка, стиральная машина и шкаф в прихожей.'
  },
  {
    id: 12, city: 'ekaterinburg', title: 'Трёхкомнатная с кабинетом', area: 'Октябрьский район',
    rooms: 3, size: 68, price: 57000, deposit: 57000, fee: 28500, pets: false,
    description: 'Гостиная, спальня и кабинет. В отдельной кухне есть стол, варочная панель и холодильник. В прихожей — вместительный встроенный шкаф.'
  }
];

