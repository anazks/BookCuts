import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getShopBookings } from '../../api/Service/Shop';

const { width } = Dimensions.get('window');

export default function Bookings() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentSummary, setPaymentSummary] = useState({
    totalEarnings: 0,
    totalBookings: 0,
    paidBookings: 0,
    pendingAmount: 0
  });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await getShopBookings();
        if (response.success) {
          const formattedBookings = response.data.map(booking => ({
            id: booking._id,
            customer: booking.userId?.name || 'Customer',
            service: booking.services.map(s => s.name).join(', '),
            date: new Date(booking.bookingDate),
            formattedDate: new Date(booking.bookingDate).toLocaleDateString(),
            time: booking.timeSlotStart,
            duration: `${booking.totalDuration} mins`,
            price: parseFloat(booking.totalPrice) || 0,
            status: booking.bookingStatus.toLowerCase(),
            staff: booking.barberName,
            paymentStatus: booking.paymentStatus,
            shopName: booking.shopDetails?.ShopName || 'Shop'
          }));
          
          // Sort bookings by date (newest first) and completed status first
          formattedBookings.sort((a, b) => {
            // If one is completed and the other isn't, completed comes first
            if (a.status === 'completed' && b.status !== 'completed') return -1;
            if (b.status === 'completed' && a.status !== 'completed') return 1;
            
            // Otherwise sort by date (newest first)
            return b.date - a.date;
          });
          
          // Calculate payment summary
          const summary = formattedBookings.reduce((acc, booking) => {
            acc.totalBookings += 1;
            
            if (booking.paymentStatus === 'paid') {
              acc.totalEarnings += booking.price;
              acc.paidBookings += 1;
            } else {
              acc.pendingAmount += booking.price;
            }
            
            return acc;
          }, {
            totalEarnings: 0,
            totalBookings: 0,
            paidBookings: 0,
            pendingAmount: 0
          });
          
          setBookings(formattedBookings);
          setPaymentSummary(summary);
        } else {
          throw new Error(response.message || 'Failed to fetch bookings');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    if (activeFilter === 'all') return true;
    return booking.status === activeFilter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#10B981';
      case 'confirmed': return '#3B82F6';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const toggleExpandBooking = (id) => {
    setExpandedBooking(expandedBooking === id ? null : id);
  };

  const renderPaymentSummary = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryCards}>
        <View style={[styles.summaryCard, styles.earningsCard]}>
          <MaterialIcons name="account-balance-wallet" size={20} color="#10B981" />
          <Text style={styles.summaryValue}>₹{paymentSummary.totalEarnings.toLocaleString('en-IN')}</Text>
          <Text style={styles.summaryLabel}>Earnings</Text>
        </View>
        
        <View style={[styles.summaryCard, styles.bookingsCard]}>
          <MaterialIcons name="event" size={20} color="#3B82F6" />
          <Text style={styles.summaryValue}>{paymentSummary.totalBookings}</Text>
          <Text style={styles.summaryLabel}>Bookings</Text>
        </View>
        
        <View style={[styles.summaryCard, styles.paidCard]}>
          <MaterialIcons name="check-circle" size={20} color="#059669" />
          <Text style={styles.summaryValue}>{paymentSummary.paidBookings}</Text>
          <Text style={styles.summaryLabel}>Paid</Text>
        </View>
        
        <View style={[styles.summaryCard, styles.pendingCard]}>
          <MaterialIcons name="schedule" size={20} color="#F59E0B" />
          <Text style={styles.summaryValue}>₹{paymentSummary.pendingAmount.toLocaleString('en-IN')}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
      </View>
    </View>
  );

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={() => toggleExpandBooking(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.customer}</Text>
          <Text style={styles.serviceName}>{item.service}</Text>
          <View style={styles.bookingMeta}>
            <MaterialIcons name="access-time" size={14} color="#6B7280" />
            <Text style={styles.timeText}>{item.formattedDate} • {item.time}</Text>
          </View>
        </View>
        
        <View style={styles.bookingRight}>
          <Text style={styles.priceText}>₹{item.price.toLocaleString('en-IN')}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {expandedBooking === item.id && (
        <View style={styles.bookingDetails}>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{item.duration}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Staff</Text>
              <Text style={styles.detailValue}>{item.staff}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Shop</Text>
              <Text style={styles.detailValue}>{item.shopName}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Payment</Text>
              <Text style={[
                styles.detailValue,
                { color: item.paymentStatus === 'paid' ? '#10B981' : '#EF4444' }
              ]}>
                {item.paymentStatus.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.actionButton}>
            <MaterialIcons name="visibility" size={20} color="#3B82F6" />
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#1F2937" barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#1F2937" barStyle="light-content" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1F2937" barStyle="light-content" />
      
      {/* Header */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings Dashboard</Text>
      </View> */}

      <ScrollView style={styles.content}>
        {/* Payment Summary */}
        {renderPaymentSummary()}

        {/* Filter Options */}
        <View style={styles.filterSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {['all', 'completed', 'confirmed', 'pending', 'cancelled'].map((filter) => (
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
        </View>

        {/* Bookings List */}
        <View style={styles.bookingsSection}>
          <Text style={styles.sectionTitle}>
            {activeFilter === 'all' ? 'All Bookings' : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Bookings`} ({filteredBookings.length})
          </Text>
          
          <FlatList
            data={filteredBookings}
            renderItem={renderBookingItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="event-busy" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No bookings found</Text>
                <Text style={styles.emptySubtext}>
                  {activeFilter === 'all' 
                    ? "You don't have any bookings yet" 
                    : `You don't have any ${activeFilter} bookings`}
                </Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryContainer: {
    margin: 16,
    marginBottom: 8,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryCard: {
    width: (width - 48) / 4, // Divide screen width minus padding by 4
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  filterSection: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  filterContainer: {
    paddingVertical: 4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilter: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterText: {
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 13,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  bookingsSection: {
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 8,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  bookingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  bookingRight: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bookingDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailItem: {
    width: '50%',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 10,
  },
  actionButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});