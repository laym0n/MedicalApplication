import React, {useState} from 'react';
import {Text, TextInput, Button, ScrollView, Alert} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {usePatientProfileModel} from '@shared/model/patientprofilemodel';
import {PatientProfile} from '@shared/db/entity/patientprofile';

const PatientProfileAddScreen = () => {
  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | undefined>();
  const [birthDate, setBirthDate] = useState('');
  const [socialStatus, setSocialStatus] = useState('');
  const [disabilityGroup, setDisabilityGroup] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [lifestyleNotes, setLifestyleNotes] = useState('');

  const {save} = usePatientProfileModel();

  const handleSubmit = async () => {
    try {
      const patientProfile = new PatientProfile();

      patientProfile.name = name;
      patientProfile.gender = gender;
      patientProfile.birthDate = birthDate ? new Date(birthDate) : undefined;
      patientProfile.socialStatus = socialStatus;
      patientProfile.disabilityGroup = disabilityGroup;
      patientProfile.chronicConditions = chronicConditions;
      patientProfile.medications = medications;
      patientProfile.allergies = allergies;
      patientProfile.lifestyleNotes = lifestyleNotes;

      await save(patientProfile);

      Alert.alert('Профиль сохранён (в памяти)');
      console.log('Encrypted profile:', patientProfile);
    } catch (error) {
      console.error(error);
      Alert.alert('Ошибка при сохранении');
    }
  };

  return (
    <ScrollView contentContainerStyle={{padding: 16}}>
      <Text>Наименование профиля</Text>
      <TextInput
        value={name}
        onChangeText={setName}
      />
      <Text>Пол</Text>
      <Picker selectedValue={gender} onValueChange={setGender}>
        <Picker.Item label="Выберите" value={undefined} />
        <Picker.Item label="Мужской" value="MALE" />
        <Picker.Item label="Женский" value="FEMALE" />
      </Picker>

      <Text>Дата рождения (ГГГГ-ММ-ДД)</Text>
      <TextInput
        value={birthDate}
        onChangeText={setBirthDate}
        placeholder="1990-01-01"
      />

      <Text>Социальный статус</Text>
      <TextInput value={socialStatus} onChangeText={setSocialStatus} />

      <Text>Группа инвалидности</Text>
      <TextInput value={disabilityGroup} onChangeText={setDisabilityGroup} />

      <Text>Хронические заболевания</Text>
      <TextInput
        value={chronicConditions}
        onChangeText={setChronicConditions}
      />

      <Text>Медикаменты</Text>
      <TextInput value={medications} onChangeText={setMedications} />

      <Text>Аллергии</Text>
      <TextInput value={allergies} onChangeText={setAllergies} />

      <Text>Заметки о стиле жизни</Text>
      <TextInput
        value={lifestyleNotes}
        onChangeText={setLifestyleNotes}
        multiline
        numberOfLines={4}
      />

      <Button title="Сохранить" onPress={handleSubmit} />
    </ScrollView>
  );
};

export default PatientProfileAddScreen;
