"""Hikâye paletleri. Her film 4–5 rengini buradan kilitler: bir mavi, bütün kadro için tek ten, bir soluk, bir iki vurgu.
Çizim modülleri renkleri içe aktarılırken okur; bu yüzden hikâye paketi, başka her şeyden önce use() çağırır
(shorts/<hikâye>/__init__.py). Bir işlem tek bir hikâye çizer."""

PALETTES = {
    'deli_dumrul': dict(COBALT='#2a3fa3', SKIN='#ee6f58', PALE='#e7dcf2', GOLD='#e3a72c', RED='#b3231c', SKIN_D='#c0473f', SKIN_L='#f89e84',
                        COAT='#23130f', LEATHER='#8a4b2c', NIGHT='#19246b', DAY='#b7c4f0', EARTH='#b0683a', EARTH_D='#7a4426', GREEN='#4f8a3a'),
    # Basat ile Tepegöz: menekşe mavisi, turuncu-kızıl ten, krem, çayır yeşili ve kan kırmızısı; altın yalnızca maden ve aslanda
    'tepegoz': dict(COBALT='#4a55c2', SKIN='#f07a3c', PALE='#f4e7c6', GOLD='#e0a02a', RED='#a8231f', SKIN_D='#bf4f26', SKIN_L='#f9a368',
                    COAT='#241512', LEATHER='#7d4a2a', NIGHT='#1c2163', DAY='#bfd2f0', EARTH='#a8703c', EARTH_D='#6f4526', GREEN='#4f8f3c'),
}
NAME = 'deli_dumrul'


def use(name):
    global NAME
    NAME = name


def get():
    return PALETTES[NAME]
