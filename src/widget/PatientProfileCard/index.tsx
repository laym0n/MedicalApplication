import {useNavigation} from '@react-navigation/native';
import {PatientProfile} from '@shared/db/entity/patientprofile';
import React, {useCallback} from 'react';
import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PatientProfileCard: React.FC<{
  patientProfile: PatientProfile;
  onDelete?: (id: string) => void;
}> = ({patientProfile, onDelete}) => {
  const navigation = useNavigation();

  const handlePress = useCallback(() => {
    navigation.navigate('PatientProfileView', {
      patientProfileId: patientProfile.id,
    });
  }, [navigation, patientProfile.id]);

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Text style={styles.cardText}>{patientProfile.name}</Text>
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(patientProfile.id)}>
          <Icon name="trash-can-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '90%',
    padding: 20,
    marginVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
  },
});

export default PatientProfileCard;
