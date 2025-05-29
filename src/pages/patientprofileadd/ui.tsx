import React, {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  HelperText,
  Divider,
  Snackbar,
} from 'react-native-paper';
import {Picker} from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import dayjs from 'dayjs';

import {usePatientProfileModel} from '@shared/model/patientprofilemodel';
import {PatientProfile} from '@shared/db/entity/patientprofile';

const PatientProfileAddScreen = () => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | undefined>();
  const [birthDate, setBirthDate] = useState('');
  const [socialStatus, setSocialStatus] = useState('');
  const [disabilityGroup, setDisabilityGroup] = useState('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [lifestyleNotes, setLifestyleNotes] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const {save} = usePatientProfileModel();

  const handleSubmit = async () => {
    if (!name.trim()) return;

    try {
      const profile = new PatientProfile();
      profile.name = name;
      profile.gender = gender;
      profile.birthDate = birthDate;
      profile.socialStatus = socialStatus;
      profile.disabilityGroup = disabilityGroup;
      profile.chronicConditions = chronicConditions;
      profile.medications = medications;
      profile.allergies = allergies;
      profile.lifestyleNotes = lifestyleNotes;

      await save(profile);
      setSnackbarVisible(true);

      // Сброс
      setName('');
      setGender(undefined);
      setBirthDate('');
      setSocialStatus('');
      setDisabilityGroup('');
      setChronicConditions('');
      setMedications('');
      setAllergies('');
      setLifestyleNotes('');
    } catch (error) {
      console.error(error);
      alert('Ошибка при сохранении профиля');
    }
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (date: Date) => {
    setBirthDate(dayjs(date).format('YYYY-MM-DD'));
    hideDatePicker();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <Card.Title title="Добавление профиля пациента" />
          <Card.Content>
            <TextInput
              label="Имя *"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />
            <HelperText type="error" visible={!name.trim()}>
              Имя обязательно
            </HelperText>

            <Text style={styles.label}>Пол</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={setGender}
                style={styles.picker}>
                <Picker.Item label="Выберите" value={undefined} />
                <Picker.Item label="Мужской" value="MALE" />
                <Picker.Item label="Женский" value="FEMALE" />
              </Picker>
            </View>

            <Text style={styles.label}>Дата рождения</Text>
            <TouchableOpacity onPress={showDatePicker} style={styles.dateInput}>
              <Text style={{color: birthDate ? '#000' : '#888'}}>
                {birthDate || 'Выберите дату'}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirmDate}
              onCancel={hideDatePicker}
            />

            <Divider style={styles.divider} />

            <Text style={styles.label}>Социальный статус</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={socialStatus}
                onValueChange={setSocialStatus}
                style={styles.picker}>
                <Picker.Item label="Выберите статус" value="" />
                <Picker.Item label="Работающий" value="employed" />
                <Picker.Item label="Безработный" value="unemployed" />
                <Picker.Item label="Пенсионер" value="retired" />
                <Picker.Item label="Студент" value="student" />
                <Picker.Item label="Другое" value="other" />
              </Picker>
            </View>

            <Text style={styles.label}>Группа инвалидности</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={disabilityGroup}
                onValueChange={setDisabilityGroup}
                style={styles.picker}>
                <Picker.Item label="Не указана" value="" />
                <Picker.Item label="I группа" value="1" />
                <Picker.Item label="II группа" value="2" />
                <Picker.Item label="III группа" value="3" />
                <Picker.Item label="Без группы" value="none" />
              </Picker>
            </View>

            <TextInput
              label="Хронические заболевания"
              value={chronicConditions}
              onChangeText={setChronicConditions}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Медикаменты"
              value={medications}
              onChangeText={setMedications}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Аллергии"
              value={allergies}
              onChangeText={setAllergies}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Заметки о стиле жизни"
              value={lifestyleNotes}
              onChangeText={setLifestyleNotes}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={[styles.input, {height: 100}]}
            />
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          disabled={!name.trim()}>
          Сохранить профиль
        </Button>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={2000}>
          Профиль успешно сохранён
        </Snackbar>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PatientProfileAddScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  input: {
    marginTop: 8,
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  submitButton: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  divider: {
    marginVertical: 16,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
});
