# 🧪 Test the Order System

## Quick Test Guide

### Step 1: Place a Test Order
1. **Open the website** in your browser
2. **Login as a customer** (or create a new account)
3. **Add products to cart** from the products page
4. **Go to checkout** and fill in shipping details
5. **Place the order** - you'll get a confirmation

### Step 2: Check Admin Dashboard
1. **Open admin dashboard** in a new tab
2. **Login as admin** (must have `role: 'admin'` in profiles)
3. **Look for notifications**:
   - 🔔 Bell icon should show "1" (new order)
   - 🟠 Orange alert banner should appear
   - Orders tab should show badge with "1"

### Step 3: View Order Details
1. **Click on Orders tab**
2. **Find your test order** in the list
3. **Click "View" button** to see full details
4. **Verify information**:
   - Customer details
   - Order items
   - Shipping address
   - Payment method

### Step 4: Update Order Status
1. **Click "Update Status"** on your order
2. **Change status** from "pending" to "confirmed"
3. **Add admin notes** (optional)
4. **Save changes**
5. **Verify status updates** in the order list

### Step 5: Test Real-time Updates
1. **Keep admin dashboard open**
2. **Place another order** in customer tab
3. **Watch for instant notification** in admin dashboard
4. **Check order count** increases automatically

## ✅ What You Should See

### Customer Side:
- ✅ Products added to cart
- ✅ Checkout form works
- ✅ Order confirmation page
- ✅ Order number generated (e.g., MUS-123456)

### Admin Side:
- ✅ Real-time notifications
- ✅ Order appears in list
- ✅ Customer details visible
- ✅ Order items displayed
- ✅ Status updates work
- ✅ Search and filtering work

## 🚨 Common Issues & Solutions

### Issue: Orders not appearing
**Solution**: Check browser console for errors, verify database connection

### Issue: Real-time not working
**Solution**: Ensure Supabase is connected, check channel subscriptions

### Issue: Can't update status
**Solution**: Verify admin permissions, check function exists in database

### Issue: Customer details missing
**Solution**: Check if profiles table has data, verify foreign key relationships

## 🔍 Debug Commands

If something's not working, run these in Supabase SQL Editor:

```sql
-- Check if orders exist
SELECT COUNT(*) FROM orders;

-- Check if order items exist
SELECT COUNT(*) FROM order_items;

-- Test the function
SELECT * FROM get_all_orders();

-- Check admin permissions
SELECT role FROM profiles WHERE email = 'your-admin-email@example.com';
```

## 🎯 Success Checklist

- [ ] Customer can place order
- [ ] Order appears in admin dashboard
- [ ] Real-time notifications work
- [ ] Order details display correctly
- [ ] Status updates save successfully
- [ ] Search and filtering work
- [ ] Mobile responsive design

## 🚀 Next Steps

Once the basic system works:
1. **Add more order statuses** (processing, shipped, delivered)
2. **Implement email notifications** for customers
3. **Add order tracking** for customers
4. **Create order reports** and analytics
5. **Add bulk operations** (bulk status updates)

---

**Need Help?** Check the browser console and database logs for detailed error information.
