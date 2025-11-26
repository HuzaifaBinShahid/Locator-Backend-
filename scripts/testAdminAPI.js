import fetch from "node-fetch";

const testAdminAPI = async () => {
  try {
    const loginResponse = await fetch(
      "http://192.168.10.9:5000/api/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@gmail.com",
          password: "admin123",
        }),
      }
    );

    const loginData = await loginResponse.json();

    if (!loginResponse.ok || !loginData.token) {
      console.log("❌ Admin login failed:", loginData.message);
      return;
    }

    const token = loginData.token;

    const statsResponse = await fetch(
      "http://192.168.10.9:5000/api/admin/stats",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const statsData = await statsResponse.json();

    if (statsResponse.ok && statsData.success) {
      console.log("✅ Admin stats fetched successfully:");
      console.log("  - Total Users:", statsData.data.totalUsers);
      console.log("  - Total Admins:", statsData.data.totalAdmins);
      console.log("  - All Users:", statsData.data.allUsers);
      console.log(
        "  - Recent Users Count:",
        statsData.data.recentUsers?.length || 0
      );
    } else {
      console.log("❌ Failed to fetch admin stats:", statsData.message);
    }

    console.log("\n3. Testing admin users endpoint...");
    const usersResponse = await fetch(
      "http://192.168.10.9:5000/api/admin/users",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const usersData = await usersResponse.json();

    if (usersResponse.ok && usersData.success) {
      console.log("✅ Admin users fetched successfully:");
      console.log(`  - Found ${usersData.data.count} users (excluding admin)`);
      usersData.data.users.forEach((user, index) => {
        console.log(
          `    ${index + 1}. ${user.username} (${user.email}) - ${user.role}`
        );
      });
    } else {
      console.log("❌ Failed to fetch users:", usersData.message);
    }

    console.log("\n✅ API testing completed!");
  } catch (error) {
    console.error("❌ Network error:", error.message);
  }
};

testAdminAPI();
