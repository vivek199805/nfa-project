 const languages =[
    {
        "id": 1,
        "name": "Assamese"
    },
    {
        "id": 2,
        "name": "Bengali"
    },
    {
        "id": 3,
        "name": "Bodo"
    },
    {
        "id": 4,
        "name": "Dogri"
    },
    {
        "id": 5,
        "name": "English"
    },
    {
        "id": 6,
        "name": "Gujarati"
    },
    {
        "id": 7,
        "name": "Hindi"
    },
    {
        "id": 8,
        "name": "Kannada"
    },
    {
        "id": 9,
        "name": "Kashmiri"
    },
    {
        "id": 10,
        "name": "Konkani"
    },
    {
        "id": 11,
        "name": "Malayalam"
    },
    {
        "id": 12,
        "name": "Manipuri"
    },
    {
        "id": 13,
        "name": "Marathi"
    },
    {
        "id": 14,
        "name": "Maithili"
    },
    {
        "id": 15,
        "name": "Nepali"
    },
    {
        "id": 16,
        "name": "Oriya"
    },
    {
        "id": 17,
        "name": "Punjabi"
    },
    {
        "id": 18,
        "name": "Sanskrit"
    },
    {
        "id": 19,
        "name": "Sindhi"
    },
    {
        "id": 20,
        "name": "Other"
    },
    {
        "id": 21,
        "name": "Tamil"
    },
    {
        "id": 22,
        "name": "Telugu"
    },
    {
        "id": 23,
        "name": "Urdu"
    },
    {
        "id": 24,
        "name": "Santhali"
    }
]


export  function fetchLanguages() {
  try {
    return languages;
  } catch (error) {
    return error;
  }
}
