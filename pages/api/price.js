export default async function handler(req, res) {
    const { fromDate, toDate } = req.query;
  
    // Dynamic filters based on date range or current date
    const filters = {
      branch: "ecc71e26-1691-11ea-b1f7-00016cd7cb45",
      createdAtFrom: fromDate || new Date().toISOString().split('T')[0] + "T00:00:00Z",
      createdAtTo: toDate || new Date().toISOString().split('T')[0] + "T23:59:59Z",
    };
  
    const apiUrl = `https://froads.trysumangaleejewellers.in/products/productrate/metadata/get-all?filters=${encodeURIComponent(JSON.stringify(filters))}`;
  
    try {
      const response = await fetch(apiUrl, {
        headers: {
          // Add your API key here if required
          // Authorization: `Bearer ${API_KEY}`
        },
      });
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prices" });
    }
  }