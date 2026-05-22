import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hesabım</Text>
      </View>
      
      <View style={styles.loginSection}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={40} color="#CCC" />
        </View>
        <Text style={styles.welcomeText}>NexBus'a Hoş Geldiniz</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.loginBtn]}>
            <Text style={styles.loginBtnText}>Giriş Yap</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.registerBtn]}>
            <Text style={styles.registerBtnText}>Üye Ol</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="cube-outline" size={24} color="#666" style={styles.menuIcon} />
          <Text style={styles.menuText}>Seyahatlerim</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="chatbubbles-outline" size={24} color="#666" style={styles.menuIcon} />
          <Text style={styles.menuText}>Değerlendirmelerim</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="ticket-outline" size={24} color="#666" style={styles.menuIcon} />
          <Text style={styles.menuText}>İndirim Kuponlarım</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#666" style={styles.menuIcon} />
          <Text style={styles.menuText}>NexBus Asistan</Text>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  loginSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtn: {
    backgroundColor: '#3B82F6',
    marginRight: 7.5,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3B82F6',
    marginLeft: 7.5,
  },
  registerBtnText: {
    color: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  menuList: {
    backgroundColor: '#FFFFFF',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});
