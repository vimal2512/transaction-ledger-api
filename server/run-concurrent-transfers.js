
import axios from "axios";

const url = "http://localhost:3000/api/transfers";

const sourceAccountId = "7da17851-38c5-4d2d-a844-a80024ede202";
const destinationAccountId = "ede8ced2-8eed-4151-956e-9f622d77b367";

const requests = [
  {
    sourceAccountId,
    destinationAccountId,
    amount: "120.00",
    referenceId: "CONCURRENT-001",
  },
  {
    sourceAccountId,
    destinationAccountId,
    amount: "120.00",
    referenceId: "CONCURRENT-002",
  },
];

const results = await Promise.all(
  requests.map(async (body) => {
    try {
      const response = await axios.post(url, body);

      return {
        referenceId: body.referenceId,
        status: response.status,
        result: response.data,
      };
    } catch (error) {
      return {
        referenceId: body.referenceId,
        status: error.response?.status ?? "NETWORK_ERROR",
        result: error.response?.data ?? error.message,
      };
    }
  })
);

console.log(JSON.stringify(results, null, 2));
