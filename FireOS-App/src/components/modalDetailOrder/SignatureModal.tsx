import React, { useState, useRef, useEffect } from 'react';
import { Modal, SafeAreaView, View, Text, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

interface SignatureModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (signature: string, nomeAssinante: string) => void;
}

export function SignatureModal({ visible, onClose, onSave }: SignatureModalProps) {
  const [nomeAssinante, setNomeAssinante] = useState('');
  const signatureRef = useRef<SignatureViewRef>(null);

  // Limpa o campo toda vez que o modal for aberto
  useEffect(() => {
    if (visible) {
      setNomeAssinante('');
    }
  }, [visible]);

  const handleConfirm = () => {
    if (nomeAssinante.trim() === '') {
      Alert.alert('Atenção', 'Por favor, informe o nome do responsável.');
      return;
    }
    // Dispara o comando para o canvas gerar a imagem
    signatureRef.current?.readSignature();
  };

  const handleOK = (signature: string) => {
    // Quando o SignatureScreen processar com sucesso, chama o callback
    onSave(signature, nomeAssinante.trim());
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Assinatura Digital</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="close" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nome do Responsável:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome completo..."
            value={nomeAssinante}
            onChangeText={setNomeAssinante}
            returnKeyType="done"
          />
        </View>

        <View style={styles.canvasWrapper}>
          <SignatureScreen
            ref={signatureRef}
            onOK={handleOK}
            onEmpty={() => Alert.alert('Aviso', 'A assinatura não pode estar vazia')}
            descriptionText=""
            autoClear={false}
            imageType="image/png"
            webStyle={`.m-signature-pad--footer { display: none; }`}
          />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.buttonClear} 
            onPress={() => signatureRef.current?.clearSignature()}
          >
            <Text style={styles.buttonText}>Limpar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.buttonSave} 
            onPress={handleConfirm}
          >
            <Text style={styles.buttonText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.surface },
  title: { fontSize: 18, fontWeight: 'bold', color: colors.link },
  inputContainer: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 10 },
  label: { marginBottom: 8, fontSize: 14, color: colors.link, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: colors.surface },
  canvasWrapper: { flex: 1, backgroundColor: colors.white },
  footer: { flexDirection: 'row', padding: 20, gap: 15, borderTopWidth: 1, borderTopColor: colors.surface },
  buttonClear: { flex: 1, backgroundColor: colors.muted, padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonSave: { flex: 2, backgroundColor: colors.success, padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
});