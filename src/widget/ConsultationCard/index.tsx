import {useNavigation} from '@react-navigation/native';
import {Consultation} from '@shared/db/entity/consultation';
import {formatDate} from '@shared/util/data-form';
import React, {useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {Card, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ConsultationCard: React.FC<{
  consultation: Consultation;
  onDelete?: (id: string) => void;
}> = ({consultation, onDelete}) => {
  const navigation = useNavigation();
  const handleViewPress = useCallback(() => {
    navigation.navigate('ConsultationView', {
      consultationId: consultation.id,
    });
  }, [consultation.id, navigation]);

  return (
    <Card style={styles.card} mode="outlined" onPress={handleViewPress}>
      <Card.Title
        title={consultation.specialization}
        subtitle={formatDate(consultation.createdAt)}
        left={props => (
          <Icon
            {...props}
            name="stethoscope"
            size={32}
            color="#007AFF"
            style={{marginLeft: 8}}
          />
        )}
      />
      <Card.Actions>
        <Button onPress={handleViewPress}>Просмотр</Button>
        {onDelete && (
          <Button onPress={() => onDelete(consultation.id)}>
            <Icon name="trash-can-outline" size={24} />
          </Button>
        )}
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    borderRadius: 12,
  },
});

export default ConsultationCard;
