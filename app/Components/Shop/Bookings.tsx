import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const bookingData = [
  {
    id: '1',
    customer: 'Rajesh Kumar',
    service: 'Haircut & Beard Trim',
    date: '2023-06-15',
    time: '10:30 AM',
    duration: '45 mins',
    price: '₹350',
    status: 'completed',
    staff: 'Arun'
  },
  {
    id: '2',
    customer: 'Priya Nair',
    service: 'Hair Color',
    date: '2023-06-15',
    time: '12:15 PM',
    duration: '2 hours',
    price: '₹1200',
    status: 'confirmed',
    staff: 'Meera'
  },
  {
    id: '3',
    customer: 'David Wilson',
    service: 'Facial & Massage',
    date: '2023-06-15',
    time: '02:30 PM',
    duration: '1 hour',
    price: '₹800',
    status: 'pending',
    staff: 'Rahul'
  },
  {
    id: '4',
    customer: 'Ananya Gupta',
    service: 'Hair Spa',
    date: '2023-06-14',
    time: '11:00 AM',
    duration: '1.5 hours',
    price: '₹950',
    status: 'completed',
    staff: 'Neha'
  },
  {
    id: '5',
    customer: 'Suresh Patel',
    service: 'Shave',
    date: '2023-06-14',
    time: '04:45 PM',
    duration: '30 mins',
    price: '₹200',
    status: 'cancelled',
    staff: 'Arun'
  },
];

export default function Bookings() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedBooking, setExpandedBooking] = useState(null);

  const filteredBookings = bookingData.filter(booking => {
    if (activeFilter === 'all') return true;
    return booking.status === activeFilter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#4CAF50';
      case 'confirmed': return '#2196F3';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const toggleExpandBooking = (id) => {
    setExpandedBooking(expandedBooking === id ? null : id);
  };

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => toggleExpandBooking(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.bookingHeader}>
        <View>
          <Text style={styles.customerName}>{item.customer}</Text>
          <Text style={styles.serviceName}>{item.service}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.bookingTime}>
        <MaterialIcons name="access-time" size={16} color="#666" />
        <Text style={styles.timeText}>{item.time} ({item.duration})</Text>
      </View>

      {expandedBooking === item.id && (
        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{item.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Staff:</Text>
            <Text style={styles.detailValue}>{item.staff}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={[styles.detailValue, styles.priceText]}>{item.price}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF6B6B" barStyle="light-content" />
      
      {/* Header */}
      

      {/* Filter Options */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.activeFilter
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter && styles.activeFilterText
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-busy" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  filterContainer: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#e9ecef',
  },
  activeFilter: {
    backgroundColor: '#FF6B6B',
  },
  filterText: {
    color: '#495057',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  listContent: {
    padding: 15,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  serviceName: {
    fontSize: 14,
    color: '#6c757d',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  bookingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#6c757d',
    marginLeft: 6,
  },
  bookingDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  detailValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
  },
  priceText: {
    color: '#28a745',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 10,
  },
});