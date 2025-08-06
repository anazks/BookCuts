import React from 'react'
import { Dimensions, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'

const { width } = Dimensions.get('window')

export default function Dashboard() {
  // Sample data
  const metrics = {
    dailyIncome: 1250,
    monthlyIncome: 28750,
    weeklyIncome: 8750,
    totalAppointments: 24,
    completedAppointments: 18,
    newCustomers: 5,
    expenses: 6250,
  }

  const calculatePercentage = (value, total) => {
    return Math.min((value / total) * 100, 100)
  }

  const ProgressBar = ({ progress }) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
    </View>
  )

  const DashboardCard = ({ title, value, subtitle, progress, progressText }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>₹{value?.toLocaleString() || value}</Text>
      {subtitle && <Text style={styles.cardSubtext}>{subtitle}</Text>}
      {progress !== undefined && (
        <View style={styles.progressContainer}>
          {progressText && <Text style={styles.progressText}>{progressText}</Text>}
          <ProgressBar progress={progress} />
          <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
        </View>
      )}
    </View>
  )

  const ActivityItem = ({ title, time, amount }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityText}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
      {amount && <Text style={styles.activityAmount}>{amount}</Text>}
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* First Row - Income Metrics */}
        <View style={styles.row}>
          <DashboardCard
            title="Daily Income"
            value={metrics.dailyIncome}
            subtitle="+12% from yesterday"
          />
          <DashboardCard
            title="Weekly Income"
            value={metrics.weeklyIncome}
            subtitle="+8% from last week"
          />
          <DashboardCard
            title="Monthly Income"
            value={metrics.monthlyIncome}
            progress={calculatePercentage(metrics.monthlyIncome, 35000)}
            progressText="Target ₹35k"
          />
          <DashboardCard
            title="Expenses"
            value={metrics.expenses}
            progress={calculatePercentage(metrics.expenses, 8000)}
            progressText="Budget ₹8k"
          />
        </View>

        {/* Second Row - Business Metrics */}
        <View style={styles.row}>
          <DashboardCard
            title="Appointments"
            value={metrics.totalAppointments}
            subtitle={`${metrics.completedAppointments} completed`}
            progress={calculatePercentage(metrics.completedAppointments, metrics.totalAppointments)}
          />
          <DashboardCard
            title="New Customers"
            value={metrics.newCustomers}
            subtitle="This week"
          />
          <DashboardCard
            title="Completion Rate"
            value={`${Math.round((metrics.completedAppointments/metrics.totalAppointments)*100)}%`}
            subtitle="Of total appointments"
          />
          <DashboardCard
            title="Avg. Daily"
            value={`₹${Math.round(metrics.dailyIncome)}`}
            subtitle="This month"
          />
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <ActivityItem
              title="Payment received"
              time="2 hours ago"
              amount="+₹500"
            />
            <View style={styles.divider} />
            <ActivityItem
              title="Appointment completed"
              time="Today, 11:30 AM"
            />
            <View style={styles.divider} />
            <ActivityItem
              title="New customer"
              time="Yesterday"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    width: width / 2 - 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 10,
    color: '#888888',
    marginBottom: 6,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressText: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 4,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    marginBottom: 2,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#4CAF50',
  },
  progressPercentage: {
    fontSize: 10,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'right',
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333333',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityText: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 10,
    color: '#666666',
    marginTop: 2,
  },
  activityAmount: {
    fontWeight: '600',
    color: '#4CAF50',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
  },
})