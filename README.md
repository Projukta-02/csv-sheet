## CSV to Google Sheets Exporter
This application provides functionality to export CSV data to Google Sheets. Users can select a CSV file, view its data, and then choose to export the visible data to a new or existing Google Sheet.

### Website Link:
https://csv-sheet.netlify.app/

### Features:
Upload CSV Files: Users can choose a CSV file to upload and view its contents.
Toggle Columns: Users have the ability to select which columns from the CSV they would like to view and export.
Search and Filter Data: Allows users to filter the CSV data by a search term.
Pagination: If the CSV file has a lot of rows, users can navigate between pages.
Export to Google Sheets: Users can export the visible (and filtered) data to a Google Sheet. They have the option to either create a new sheet or append to an existing sheet by providing a Spreadsheet ID.
Google Authentication: Uses Google's API to authenticate users and access Google Sheets.

### Implementation:
The application is built using React.
CSV parsing is handled by PapaParse.
Google's API is used to authenticate users and interact with Google Sheets.

### How to Use:
Upload CSV File: Choose a CSV file to upload.
Select Columns: Toggle the columns you'd like to view and export.
Filter Data: Enter a search term to filter the data.
Navigate: Use the pagination buttons to navigate between pages if the CSV file has many rows.
Export:
Optionally provide a name for the new Google Sheet or an ID of an existing sheet.
Click the "Export to Google Sheets" button.
The exported data will be available in Google Sheets. Any feedback or error messages will be displayed in the feedback section of the application.
