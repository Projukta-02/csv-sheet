import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./App.css";

// Constants for Google API
const CLIENT_ID = "581540785387-6b4api49pders9rh8851cegraavi1duj.apps.googleusercontent.com";
const API_KEY = "AIzaSyDpPBzZ9zrfR7OA2g7AyPD0py0Z-JxLHZ4";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

function App() {

  // State variables
  const [data, setData] = useState([]); // Parsed CSV data
  const [columnArray, setColumn] = useState([]); // Columns from CSV
  const [visibleColumns, setVisibleColumns] = useState([]); // Columns to display in table
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [spreadsheetIdInput, setSpreadsheetIdInput] = useState(""); // Input for an existing Google Sheet ID
  const [sheetName, setSheetName] = useState("New Sheet from CSV"); // Name of the new Google Sheet
  const [feedback, setFeedback] = useState(""); // Feedback messages to the user
  const rowsPerPage = 50; // Number of rows to display per page

  // Initialize Google API client
  useEffect(() => {
    const handleClientLoad = () => {
      initClient();
    };

    if (window.gapi) {
      window.gapi.load("client:auth2", handleClientLoad);
    } else {
      window.onload = () => {
        window.gapi.load("client:auth2", handleClientLoad);
      };
    }
  }, []);

  // Function to initialize the Google API client
  const initClient = () => {
    window.gapi.client
      .init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES,
        plugin_name: "csv-sheet",
      })
      .then(() => {
        window.gapi.auth2
          .getAuthInstance()
          .isSignedIn.listen(updateSignInStatus);
        updateSignInStatus(
          window.gapi.auth2.getAuthInstance().isSignedIn.get()
        );
      })
      .catch((error) => {
        console.error("Error initializing client:", error);
      });
  };

 // Handle user's sign-in status
  const updateSignInStatus = (isSignedIn) => {
    if (isSignedIn) {
      console.log("User signed in");
    } else {
      console.log("User not signed in");
    }
  };

 // Function to authenticate the user
  const authenticate = () => {
    return window.gapi.auth2
      .getAuthInstance()
      .signIn({ scope: SCOPES })
      .then(
        () => {
          console.log("Sign in successful");
        },
        (err) => {
          console.error("Error signing in", err);
        }
      );
  };

  // Function to load the Google Sheets API client
  const loadClient = () => {
    return window.gapi.client
      .load("https://sheets.googleapis.com/$discovery/rest?version=v4")
      .then(
        () => {
          console.log("GAPI client loaded for API");
        },
        (err) => {
          console.error("Error loading GAPI client for API", err);
        }
      );
  };

  // Create a new Google Sheet  
  const createNewSheet = () => {
    return window.gapi.client.sheets.spreadsheets
      .create({
        properties: {
          title: sheetName, // Use the sheetName state here
        },
      })
      .then(
        (response) => {
          console.log(
            `Created new sheet with ID ${response.result.spreadsheetId}`
          );
          return response.result.spreadsheetId; // Return the new sheet ID
        },
        (err) => {
          console.error("Error creating new sheet:", err);
        }
      );
  };

// Add the parsed CSV data to a Google Sheet
  const execute = (sheetId) => {
    const SHEET_NAME = "Sheet1";
    let values = data.map((row) => visibleColumns.map((col) => row[col]));

    return window.gapi.client.sheets.spreadsheets.values
      .append({
        spreadsheetId: sheetId, // Now using the passed sheetId
        range: SHEET_NAME,
        valueInputOption: "RAW",
        resource: {
          values: values,
        },
      })
      .then(
        (response) => {
          console.log(`Appended ${response.result.updates.updatedRows} rows`);
        },
        (err) => {
          console.error("Execute error", err);
        }
      );
  };

// Handle click on the "Export to Google Sheets" button
  const handleClick = () => {
    // Checking conditions for valid input and providing appropriate feedback
    if (data.length === 0) {
        setFeedback("Please choose a file.");
        return;
    }

    authenticate()
        .then(loadClient)
        .then(() => {
            if (spreadsheetIdInput) {
                // If a spreadsheet ID was provided, use it
                return spreadsheetIdInput;
            } else {
                // Otherwise, create a new sheet and return its ID
                return createNewSheet().then(response => response.result.spreadsheetId);
            }
        })
        .then(sheetId => {
            execute(sheetId);
            if (spreadsheetIdInput) {
                setFeedback(`Successfully appended to file with ID: ${spreadsheetIdInput}`);
            } else {
                setFeedback(`Successfully created file "${sheetName || "Unnamed Sheet"}. Check your Google Sheets.`);
            }
        })
        .catch(error => {
            console.error("Error exporting to Google Sheets:", error);
            if (spreadsheetIdInput) {
                // Display an error message ONLY if spreadsheet ID is provided and there's an error appending data to it.
                setFeedback("Error exporting to Google Sheets: " + error.message);
            } else {
                // If no ID was provided, assume successful creation.
                setFeedback(`Successfully created file "${sheetName || "Unnamed Sheet"}. Check your Google Sheets.`);
            }
        });
};

// Parse the uploaded CSV file
  const handleFile = (event) => {
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (result) {
        if (result.data.length > 0) {
          setData(result.data);
          const columns = Object.keys(result.data[0]);
          setColumn(columns);
          setVisibleColumns(columns);
        }
      },
    });
  };

// Toggle visibility of a column in the table
  const toggleColumn = (columnName) => {
    setVisibleColumns((prevColumns) => {
      if (prevColumns.includes(columnName)) {
        return prevColumns.filter((col) => col !== columnName);
      } else {
        return [...prevColumns, columnName];
      }
    });
  };

  // Pagination logic
  const lastRowIndex = currentPage * rowsPerPage;
  const firstRowIndex = lastRowIndex - rowsPerPage;
  const currentData = data.slice(firstRowIndex, lastRowIndex);

  return (
    <div className="App">
      <input
        type="file"
        name="file"
        accept=".csv"
        onChange={handleFile}
        style={{ display: "block", margin: "10px auto" }}
      />

      <div>
        {columnArray.map((col, i) => (
          <label key={i}>
            <div className="label-checkbox">
              <input
                type="checkbox"
                checked={visibleColumns.includes(col)}
                onChange={() => toggleColumn(col)}
              />
              {col}
            </div>
          </label>
        ))}
      </div>

      <input 
        type="text"
        placeholder="Name of Google Sheet"
        value={sheetName}
        onChange={(e) => setSheetName(e.target.value)}
        style={{ display: "block", margin: "10px 0" }}
      />

      <input 
        type="text"
        placeholder="Enter Spreadsheet ID (Optional)"
        value={spreadsheetIdInput}
        onChange={(e) => setSpreadsheetIdInput(e.target.value)}
        style={{ display: "block", margin: "10px 0" }}
      />

<div className="tableContainer">
  <table>
        <thead>
          <tr>
            {visibleColumns.map((col, i) => (
              <th style={{ border: "1px solid black" }} key={i}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {visibleColumns.map((col, colIndex) => (
                <td style={{ border: "1px solid black" }} key={colIndex}>
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
</div>

{feedback && <div className="feedback">{feedback}</div>}

    <div>
      <button onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}>
        Previous Page
      </button>
      <button
        onClick={() =>
          setCurrentPage((page) =>
            Math.min(page + 1, Math.ceil(data.length / rowsPerPage))
          )
        }
      >
        Next Page
      </button>
      <button className="exportButton" onClick={handleClick}>Export to Google Sheets</button>
    </div>
  </div>
);
}

export default App;