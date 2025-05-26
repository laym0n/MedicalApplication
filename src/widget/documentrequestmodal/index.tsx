import React, {useCallback, useMemo, useState} from 'react';
import {Button, Modal, StyleSheet, Text, View} from 'react-native';
import {Document} from '@shared/db/entity/document';
import {PatientProfile} from '@shared/db/entity/patientprofile';
import {Consultation} from '@shared/db/entity/consultation';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import Icon from 'react-native-vector-icons/MaterialIcons';
import useDataExchange from './model/index';

const DocumentRequestModal: React.FC<{
  documents: Document[];
  patientProfiles: PatientProfile[];
  consultations: Consultation[];
  onSend: (selectedIds: {
    documentIds: string[];
    profileIds: string[];
    consultationIds: string[];
  }) => void;
  visible: boolean;
  onIgnore: any;
}> = ({
  documents,
  patientProfiles,
  consultations,
  visible,
  onIgnore,
  onSend,
}) => {
  const groupedItems = [
    {
      id: 'document',
      name: 'Документ',
      children: documents?.map(doc => ({id: doc.id, name: doc.name})),
    },
    {
      id: 'profile',
      name: 'Профиль пациента',
      children: patientProfiles?.map(p => ({id: p.id, name: p.name})),
    },
    {
      id: 'consultation',
      name: 'Консультации',
      children: consultations?.map(c => ({id: c.id, name: c.id})),
    },
  ];

  const [selectedAll, setSelectedAll] = useState<string[]>([]);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [selectedConsultationIds, setSelectedConsultationIds] = useState<
    string[]
  >([]);

  const docIds = useMemo(() => documents.map(d => d.id), [documents]);
  const profileIds = useMemo(
    () => patientProfiles.map(d => d.id),
    [patientProfiles],
  );
  const consultIds = useMemo(
    () => consultations.map(d => d.id),
    [consultations],
  );

  const onSelectedItemsChange = useCallback(
    (selected: string[]) => {
      setSelectedAll(selected);

      setSelectedDocumentIds(selected.filter(id => docIds.includes(id)));
      setSelectedProfileIds(selected.filter(id => profileIds.includes(id)));
      setSelectedConsultationIds(
        selected.filter(id => consultIds.includes(id)),
      );
    },
    [consultIds, docIds, profileIds],
  );

  const handleSendPress = useCallback(() => {
    onSend({
      consultationIds: selectedConsultationIds,
      profileIds: selectedProfileIds,
      documentIds: selectedDocumentIds,
    });
  }, [
    onSend,
    selectedConsultationIds,
    selectedDocumentIds,
    selectedProfileIds,
  ]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Запрос данных</Text>
          <Text style={styles.description}>Выберите данные для отправки</Text>
          <SectionedMultiSelect
            items={groupedItems}
            uniqueKey="id"
            subKey="children"
            selectText="Выберите элементы"
            showDropDowns={true}
            readOnlyHeadings={true}
            onSelectedItemsChange={onSelectedItemsChange}
            selectedItems={selectedAll}
            IconRenderer={Icon}
          />

          <View style={styles.buttons}>
            <Button title="Игнорировать" color="#999" onPress={onIgnore} />
            <Button title="Отправить" onPress={handleSendPress} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ConsultationResultModal: React.FC<{
  visible: boolean;
  onIgnore: any;
  onReadyToReceiveConsultationResults: any;
}> = ({visible, onIgnore, onReadyToReceiveConsultationResults}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Загрузка результатов консультации</Text>
          <Text style={styles.description}>Согласиться сохранить результаты консультации</Text>

          <View style={styles.buttons}>
            <Button title="Игнорировать" color="#999" onPress={onIgnore} />
            <Button title="Загрузить" onPress={onReadyToReceiveConsultationResults} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const OfferModal: React.FC<{}> = ({}) => {
  const {
    documents,
    patientProfiles,
    consultations,
    onIgnore,
    onSend,
    visible,
    onReadyToReceiveConsultationResults,
    offerPayload,
  } = useDataExchange();

  return (
    <>
      {offerPayload?.type === 'offer_request' && (
        <DocumentRequestModal
          documents={documents}
          consultations={consultations}
          patientProfiles={patientProfiles}
          onIgnore={onIgnore}
          onSend={onSend}
          visible={visible}
        />
      )}
      {offerPayload?.type === 'offer_upload' && (
        <ConsultationResultModal
          onIgnore={onIgnore}
          visible={visible}
          onReadyToReceiveConsultationResults={onReadyToReceiveConsultationResults}
        />
      )}
    </>
  );
};

const DocumentRequestNotification: React.FC<{}> = () => {
  return <OfferModal />;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArea: {
    marginBottom: 16,
  },
  section: {
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    marginBottom: 20,
    fontSize: 16,
    color: '#555',
  },
  pickButton: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  pickButtonText: {
    color: '#333',
  },
  picker: {
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default DocumentRequestNotification;
