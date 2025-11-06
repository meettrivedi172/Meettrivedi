import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

// Field Type Enum
export enum FieldDataType {
  Number = 2,
  Boolean = 3,
  Decimal = 4,
  DateTime = 5,
  TimeStamp = 6,
  String = 13,
  Lookup = 17,
  Text = 24
}

// Lookup Details
export interface LookupDetails {
  targetObjectName: string;
  targetDisplayField: string;
}

// Field Model
export interface Field {
  id: string;
  name: string;
  displayName: string;
  dataType: FieldDataType;
  isPrimaryKey: boolean;
  isRequired: boolean;
  isLookup: boolean;
  lookupDetails?: LookupDetails;
  defaultValue?: any;
}

// App Object (Table/View)
export interface AppObject {
  id: string;
  name: string;
  displayName: string;
  type: 'Table' | 'View';
  fields: Field[];
}

// Schema Data
export interface SchemaData {
  appObjects: AppObject[];
}

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  
  // Helper to parse DataType string to enum
  private parseDataType(type: string | number): FieldDataType {
    if (typeof type === 'string') {
      const typeMap: { [key: string]: FieldDataType } = {
        'Int': FieldDataType.Number,
        'String': FieldDataType.String,
        'Boolean': FieldDataType.Boolean,
        'Date': FieldDataType.DateTime,
        'Decimal': FieldDataType.Decimal,
        'Text': FieldDataType.Text
      };
      return typeMap[type] || FieldDataType.String;
    }
    return type as FieldDataType;
  }

  // Helper to determine if field is lookup
  private isLookupField(field: any): boolean {
    const dt = typeof field.FieldType.DataType === 'number' 
      ? field.FieldType.DataType 
      : parseInt(field.FieldType.DataType || '0');
    return dt === 17 || field.LookUpDetails !== null;
  }

  // Helper to map raw API data to internal format
  private mapApiDataToSchema(apiData: any): SchemaData {
    return {
      appObjects: apiData.map((obj: any) => ({
        id: obj.ID,
        name: obj.SystemDBTableName,  // Use SystemDBTableName
        displayName: obj.DisplayName,
        type: 'Table' as const,
        fields: obj.Fields.map((field: any) => ({
          id: field.ID,
          name: field.SystemDBFieldName,  // Use SystemDBFieldName
          displayName: field.DisplayName,
          dataType: this.parseDataType(field.FieldType.DataType),
          isPrimaryKey: field.IsPrimaryKey,
          isRequired: field.IsRequired,
          isLookup: this.isLookupField(field),
          lookupDetails: field.LookUpDetails ? {
            targetObjectName: field.LookUpDetails.LookupObject,
            targetDisplayField: field.LookUpDetails.DisplayField
          } : undefined
        }))
      }))
    };
  }

  // Real API data converted to internal format
  private dummySchema: SchemaData;
  
  constructor() {
    const rawApiData = [
    {
      "ID": "0fc9b4a0-0362-4804-9721-3920ce57eded",
      "ObjectName": "TABD_ReferenceLinks",
      "DisplayName": "TABD_ReferenceLinks",
      "Description": null,
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": true,
      "DeploymentStatus": 1,
      "Fields": [
        {
          "ID": "dcff2542-416a-4761-96f2-402a6ece4f04",
          "ObjectID": null,
          "ObjectID_Tosave": "0fc9b4a0-0362-4804-9721-3920ce57eded",
          "FieldName": "Id",
          "DisplayName": "Id",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Id",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "7f1fd801-e6ae-40fe-9875-4bea96232864",
          "ObjectID": null,
          "ObjectID_Tosave": "0fc9b4a0-0362-4804-9721-3920ce57eded",
          "FieldName": "LinkType",
          "DisplayName": "LinkType",
          "FieldType": {
            "DataType": 2,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "LinkType",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "788adb51-c589-417c-a760-61eec77f851a",
          "ObjectID": null,
          "ObjectID_Tosave": "0fc9b4a0-0362-4804-9721-3920ce57eded",
          "FieldName": "URL",
          "DisplayName": "URL",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "URL",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "b7507862-2f44-4e8f-8dce-8fd5c86d5f19",
          "ObjectID": null,
          "ObjectID_Tosave": "0fc9b4a0-0362-4804-9721-3920ce57eded",
          "FieldName": "RecordId",
          "DisplayName": "RecordId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "7055e74e-c75e-46e5-912a-c6f8e12245a3",
          "ObjectID": null,
          "ObjectID_Tosave": "0fc9b4a0-0362-4804-9721-3920ce57eded",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "0FC9B4A0-0362-4804-9721-3920CE57EDED",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": null,
      "DataSourceQueries": [
        {
          "ID": "5ef943e4-3302-48ed-9dc8-1451493c6ac5",
          "ObjectID": null,
          "ObjectID_Tosave": "0fc9b4a0-0362-4804-9721-3920ce57eded",
          "QueryName": "Detail_TABD_ReferenceLinks",
          "DisplayName": "Detail_TABD_ReferenceLinks",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "807bde25-b5bd-481f-93e4-0cef1095e246",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "dcff2542-416a-4761-96f2-402a6ece4f04"
            },
            {
              "ID": "bdd253ef-4cf3-45b6-bf0a-9334c08aef4d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "7f1fd801-e6ae-40fe-9875-4bea96232864"
            },
            {
              "ID": "4047ab1a-28e5-4a85-b926-b1809fb529e1",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b7507862-2f44-4e8f-8dce-8fd5c86d5f19"
            },
            {
              "ID": "d80da352-2cae-4851-ade3-c1b80be17294",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "788adb51-c589-417c-a760-61eec77f851a"
            },
            {
              "ID": "3b2e0844-d7e3-40c7-bce2-d3530ba4fc8a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "7055e74e-c75e-46e5-912a-c6f8e12245a3"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "ca2cfa52-cb4a-485e-8620-45ec1e32cbcc",
              "ParameterName": "Id",
              "DataSourceQueryID": "5ef943e4-3302-48ed-9dc8-1451493c6ac5",
              "MappingFieldName": "Id",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "48a4631a-a853-445b-bf27-4807d1d2e09b",
          "ObjectID": null,
          "ObjectID_Tosave": "0fc9b4a0-0362-4804-9721-3920ce57eded",
          "QueryName": "Default_TABD_ReferenceLinks",
          "DisplayName": "Default_TABD_ReferenceLinks",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "3f3dedc5-9c51-41ac-bd0f-35cbcf8a2dcb",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "788adb51-c589-417c-a760-61eec77f851a"
            },
            {
              "ID": "44998d6e-2b1d-4cec-b030-3f55d891e211",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "7055e74e-c75e-46e5-912a-c6f8e12245a3"
            },
            {
              "ID": "b70cacdd-bddc-4352-a2f7-600e207ade88",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "7f1fd801-e6ae-40fe-9875-4bea96232864"
            },
            {
              "ID": "2eff3119-3c1f-4c27-b8e4-a8c94195f942",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "dcff2542-416a-4761-96f2-402a6ece4f04"
            },
            {
              "ID": "f1b94c5f-3bdc-4d12-a61d-bd71cad34662",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b7507862-2f44-4e8f-8dce-8fd5c86d5f19"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "17e72a35-5275-4130-99b6-5cfcc1106e53",
          "ObjectID": null,
          "ObjectID_Tosave": "0fc9b4a0-0362-4804-9721-3920ce57eded",
          "QueryName": "DEV_TABD_ReferenceLinks",
          "DisplayName": "DEV_TABD_ReferenceLinks",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "4e87b67c-3c1c-4049-bc2c-0afcd9650f9d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "7f1fd801-e6ae-40fe-9875-4bea96232864"
            },
            {
              "ID": "6242aad9-5db8-4e67-964e-d38e5f8e88ec",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "dcff2542-416a-4761-96f2-402a6ece4f04"
            },
            {
              "ID": "fefacd55-1113-49be-86b5-ee8450300183",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "788adb51-c589-417c-a760-61eec77f851a"
            },
            {
              "ID": "ad88d968-43c5-42bd-9dc2-fc56e4cbd7c1",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "7055e74e-c75e-46e5-912a-c6f8e12245a3"
            },
            {
              "ID": "54e7f042-6597-4368-88cc-feed39529365",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b7507862-2f44-4e8f-8dce-8fd5c86d5f19"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "7cf15276-9399-466f-9ee1-c0a15e6ce240",
          "ObjectID": null,
          "ObjectID_Tosave": "0fc9b4a0-0362-4804-9721-3920ce57eded",
          "QueryName": "List_TABD_ReferenceLinks",
          "DisplayName": "List_TABD_ReferenceLinks",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "06f71b80-359a-4f7b-b915-41b70a267384",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "dcff2542-416a-4761-96f2-402a6ece4f04"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "TABD_ReferenceLinks",
      "Resources": null,
      "IsSystem": false,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "0fc9b4a0-0362-4804-9721-3920ce57eded",
      "AppObjectConfiguration": null,
      "AllowVersioning": false,
      "IsSupportBluePrint": null,
      "IsLocationTracking": null,
      "AllowSoftDelete": true,
      "IsReplicationNeeded": null,
      "IsCacheEnable": false,
      "CacheTtl": null,
      "ConnectionId": "0a08b86a-dd7b-4695-ada9-6d6dae85af59",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "33537d9d-4ceb-43ee-97db-57ea5677bf47",
        "UpdatedBy": null,
        "CreatedOn": "2024-09-23T16:22:37.737",
        "UpdatedOn": "2025-05-15T08:02:23",
        "IsSystemRecord": true,
        "AppId": null
      }
    },
    {
      "ID": "476e94dd-e124-479a-862d-33b495022971",
      "ObjectName": "TABD_PublishedLinks",
      "DisplayName": "TABD_PublishedLinks",
      "Description": null,
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": true,
      "DeploymentStatus": 1,
      "Fields": [
        {
          "ID": "2b4034cb-44bb-4329-bb8e-0bb374003469",
          "ObjectID": null,
          "ObjectID_Tosave": "476e94dd-e124-479a-862d-33b495022971",
          "FieldName": "URL",
          "DisplayName": "URL",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "URL",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "254fb68f-d8c8-40de-b1df-125fa8250524",
          "ObjectID": null,
          "ObjectID_Tosave": "476e94dd-e124-479a-862d-33b495022971",
          "FieldName": "FromUser",
          "DisplayName": "FromUser",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "FromUser",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "d182baa2-a672-43a0-9502-384a2634bb8e",
          "ObjectID": null,
          "ObjectID_Tosave": "476e94dd-e124-479a-862d-33b495022971",
          "FieldName": "Validity",
          "DisplayName": "Validity",
          "FieldType": {
            "DataType": 2,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Validity",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "9619f52d-b5ff-4702-97d4-4e83b68b7e94",
          "ObjectID": null,
          "ObjectID_Tosave": "476e94dd-e124-479a-862d-33b495022971",
          "FieldName": "ID",
          "DisplayName": "ID",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "ID",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "5f1b6606-c4ca-47d4-ab19-73bce256227c",
          "ObjectID": null,
          "ObjectID_Tosave": "476e94dd-e124-479a-862d-33b495022971",
          "FieldName": "LinkBody",
          "DisplayName": "LinkBody",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "LinkBody",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "79dcc3c5-7b61-49e3-960b-e9c6514d6dc9",
          "ObjectID": null,
          "ObjectID_Tosave": "476e94dd-e124-479a-862d-33b495022971",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "476e94dd-e124-479a-862d-33b495022971",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "90e24203-b1cf-4360-bb2e-fc0bb36ed02c",
          "ObjectID": null,
          "ObjectID_Tosave": "476e94dd-e124-479a-862d-33b495022971",
          "FieldName": "SentOn",
          "DisplayName": "SentOn",
          "FieldType": {
            "DataType": 6,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "SentOn",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": null,
      "DataSourceQueries": [
        {
          "ID": "a1c9ff61-b4d8-4936-9db9-535860914f6f",
          "ObjectID": null,
          "ObjectID_Tosave": "476e94dd-e124-479a-862d-33b495022971",
          "QueryName": "DEV_TABD_PublishedLinks",
          "DisplayName": "DEV_TABD_PublishedLinks",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "2a3a7645-b97e-4785-8772-19d2f88e4f26",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "5f1b6606-c4ca-47d4-ab19-73bce256227c"
            },
            {
              "ID": "5da5f0d4-5aef-48f4-be80-260d5214f88a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9619f52d-b5ff-4702-97d4-4e83b68b7e94"
            },
            {
              "ID": "2a14a9f4-f0c9-44e9-8ec9-400470b6d0e0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "90e24203-b1cf-4360-bb2e-fc0bb36ed02c"
            },
            {
              "ID": "b3646dd5-5f31-4660-b223-4d3933978cc5",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d182baa2-a672-43a0-9502-384a2634bb8e"
            },
            {
              "ID": "264693cc-cef0-43db-ad4f-6f51d3983b5c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "79dcc3c5-7b61-49e3-960b-e9c6514d6dc9"
            },
            {
              "ID": "33f8e5aa-e633-4d3a-8bf1-92f7aff1d815",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "2b4034cb-44bb-4329-bb8e-0bb374003469"
            },
            {
              "ID": "9f9b272e-c47b-4296-9507-c9d63791cd6f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "254fb68f-d8c8-40de-b1df-125fa8250524"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "49787485-07d1-4a71-987f-56f93f1828b7",
          "ObjectID": null,
          "ObjectID_Tosave": "476e94dd-e124-479a-862d-33b495022971",
          "QueryName": "Detail_TABD_PublishedLinks",
          "DisplayName": "Detail_TABD_PublishedLinks",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "2859a525-17cb-4972-b8ac-4803d5820c4e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9619f52d-b5ff-4702-97d4-4e83b68b7e94"
            },
            {
              "ID": "a086c925-bbf9-46c3-bb44-7e30abfcff20",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "5f1b6606-c4ca-47d4-ab19-73bce256227c"
            },
            {
              "ID": "b9f7032f-b69a-49b4-9639-8c8866cb94e9",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "79dcc3c5-7b61-49e3-960b-e9c6514d6dc9"
            },
            {
              "ID": "141abbfb-8c2a-4fd4-b08f-9796efa14518",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d182baa2-a672-43a0-9502-384a2634bb8e"
            },
            {
              "ID": "f97f1915-6197-4d66-81c2-9b89c8615d76",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "2b4034cb-44bb-4329-bb8e-0bb374003469"
            },
            {
              "ID": "2f0b759d-2564-4d46-b4d6-d7967599393a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "90e24203-b1cf-4360-bb2e-fc0bb36ed02c"
            },
            {
              "ID": "89c0212c-d32e-465e-a6b2-e63d5f21ec0f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "254fb68f-d8c8-40de-b1df-125fa8250524"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "fb4deb32-db32-4d3f-a774-3c52a7958b56",
              "ParameterName": "ID",
              "DataSourceQueryID": "49787485-07d1-4a71-987f-56f93f1828b7",
              "MappingFieldName": "ID",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "baba76e6-4f31-41ab-9922-58d637f6cebf",
          "ObjectID": null,
          "ObjectID_Tosave": "476e94dd-e124-479a-862d-33b495022971",
          "QueryName": "Default_TABD_PublishedLinks",
          "DisplayName": "Default_TABD_PublishedLinks",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "5d52a9d9-3133-4819-8ddc-3f25507143e2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "90e24203-b1cf-4360-bb2e-fc0bb36ed02c"
            },
            {
              "ID": "79120e9c-1aa7-458b-bb4e-597690250fe7",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "79dcc3c5-7b61-49e3-960b-e9c6514d6dc9"
            },
            {
              "ID": "0e06cca9-a9df-4953-a2e8-ab656bbd7b72",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "254fb68f-d8c8-40de-b1df-125fa8250524"
            },
            {
              "ID": "78d68a85-2ad5-4d54-8ca9-cacf534515e5",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9619f52d-b5ff-4702-97d4-4e83b68b7e94"
            },
            {
              "ID": "b0657813-37a2-443b-8b90-d3127ce3e252",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "5f1b6606-c4ca-47d4-ab19-73bce256227c"
            },
            {
              "ID": "7a28934b-bba5-4405-9567-d6aeda9edb08",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "2b4034cb-44bb-4329-bb8e-0bb374003469"
            },
            {
              "ID": "e8556288-3f20-4316-ad16-db186309d0ec",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d182baa2-a672-43a0-9502-384a2634bb8e"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "6b984325-081b-46e6-b55a-5fe18d15b75f",
          "ObjectID": null,
          "ObjectID_Tosave": "476e94dd-e124-479a-862d-33b495022971",
          "QueryName": "List_TABD_PublishedLinks",
          "DisplayName": "List_TABD_PublishedLinks",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "ea3c2ddb-94b1-4c78-b7a9-09b3e6c14f90",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9619f52d-b5ff-4702-97d4-4e83b68b7e94"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "TABD_PublishedLinks",
      "Resources": null,
      "IsSystem": false,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "476e94dd-e124-479a-862d-33b495022971",
      "AppObjectConfiguration": null,
      "AllowVersioning": false,
      "IsSupportBluePrint": null,
      "IsLocationTracking": null,
      "AllowSoftDelete": true,
      "IsReplicationNeeded": null,
      "IsCacheEnable": false,
      "CacheTtl": null,
      "ConnectionId": "0a08b86a-dd7b-4695-ada9-6d6dae85af59",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "d052a189-a33f-4acd-8012-f66f9cc07cd3",
        "UpdatedBy": null,
        "CreatedOn": "2025-03-13T13:36:16.207",
        "UpdatedOn": "2025-05-15T08:02:23",
        "IsSystemRecord": true,
        "AppId": null
      }
    },
    {
      "ID": "f23a6b47-8b0b-4fd0-9736-08c7c8670fc9",
      "ObjectName": "TABMD_Environment",
      "DisplayName": "TABMD_Environment",
      "Description": null,
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": true,
      "DeploymentStatus": 1,
      "Fields": [
        {
          "ID": "75133de5-8863-49b0-9df5-06225cc9ce40",
          "ObjectID": null,
          "ObjectID_Tosave": "f23a6b47-8b0b-4fd0-9736-08c7c8670fc9",
          "FieldName": "Id",
          "DisplayName": "Id",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Id",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "c83a2d34-7606-4cf1-90d9-2e5d2234a71d",
          "ObjectID": null,
          "ObjectID_Tosave": "f23a6b47-8b0b-4fd0-9736-08c7c8670fc9",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "f23a6b47-8b0b-4fd0-9736-08c7c8670fc9",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "ab4a0b92-4d97-4806-902c-645b13a3b41a",
          "ObjectID": null,
          "ObjectID_Tosave": "f23a6b47-8b0b-4fd0-9736-08c7c8670fc9",
          "FieldName": "AppId",
          "DisplayName": "AppId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "AppId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "6a1a016c-9e50-42fa-b8c2-6549cbf5c056",
          "ObjectID": null,
          "ObjectID_Tosave": "f23a6b47-8b0b-4fd0-9736-08c7c8670fc9",
          "FieldName": "Sequence",
          "DisplayName": "Sequence",
          "FieldType": {
            "DataType": 2,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Sequence",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "1d746f3a-19f4-466a-893f-6fb336ac07cf",
          "ObjectID": null,
          "ObjectID_Tosave": "f23a6b47-8b0b-4fd0-9736-08c7c8670fc9",
          "FieldName": "Name",
          "DisplayName": "Name",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Name",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "708099da-129b-4a77-8d4c-923b63cf1bd3",
          "ObjectID": null,
          "ObjectID_Tosave": "f23a6b47-8b0b-4fd0-9736-08c7c8670fc9",
          "FieldName": "ReleaseVersion",
          "DisplayName": "ReleaseVersion",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "ReleaseVersion",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": [
        {
          "childDetails": {
            "LookupObject": "TABMD_User_Environments",
            "LookupField": "AppEnvironmentId",
            "DisplayField": "",
            "selectQuery": null
          },
          "LocalId": "Id"
        }
      ],
      "DataSourceQueries": [
        {
          "ID": "64fc3233-7f0e-401b-b0a0-0323fbfc1737",
          "ObjectID": null,
          "ObjectID_Tosave": "f23a6b47-8b0b-4fd0-9736-08c7c8670fc9",
          "QueryName": "Detail_TABMD_Environment",
          "DisplayName": "Detail_TABMD_Environment",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "f7a134e7-0d15-49da-8891-026522417e4a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ab4a0b92-4d97-4806-902c-645b13a3b41a"
            },
            {
              "ID": "defcadaf-50ad-4b4a-aa2b-0732a508a5c0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "75133de5-8863-49b0-9df5-06225cc9ce40"
            },
            {
              "ID": "fbe0d0aa-e797-453a-9480-24018775b252",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "708099da-129b-4a77-8d4c-923b63cf1bd3"
            },
            {
              "ID": "6679ec88-cb5b-428b-bd46-7cda392dfd0d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c83a2d34-7606-4cf1-90d9-2e5d2234a71d"
            },
            {
              "ID": "8136ce0e-69c4-401c-9e45-a8b76a49bd2b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6a1a016c-9e50-42fa-b8c2-6549cbf5c056"
            },
            {
              "ID": "49cf66eb-a068-4ce8-9870-e64c84fcd63c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1d746f3a-19f4-466a-893f-6fb336ac07cf"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "8d64fb60-9838-4ac1-a839-0c94e202a523",
              "ParameterName": "Id",
              "DataSourceQueryID": "64fc3233-7f0e-401b-b0a0-0323fbfc1737",
              "MappingFieldName": "Id",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "ae6d24bb-03cc-421a-a712-50ec77e6eaaa",
          "ObjectID": null,
          "ObjectID_Tosave": "f23a6b47-8b0b-4fd0-9736-08c7c8670fc9",
          "QueryName": "get_TABMD_Environment_By_Id",
          "DisplayName": "get_TABMD_Environment_By_Id",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "2b27c740-3cec-4f1a-87fb-51705bd53732",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ab4a0b92-4d97-4806-902c-645b13a3b41a"
            },
            {
              "ID": "5d2bc2e9-1f7a-4bd5-bc5e-b2d57bdaa27d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "75133de5-8863-49b0-9df5-06225cc9ce40"
            },
            {
              "ID": "047bf039-4a93-44f7-a994-bd48fdb26ecf",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "708099da-129b-4a77-8d4c-923b63cf1bd3"
            },
            {
              "ID": "2af8ba62-ec14-4aba-b58f-cfef88964c49",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1d746f3a-19f4-466a-893f-6fb336ac07cf"
            },
            {
              "ID": "9cf79754-43ea-4e9a-91bb-e1d0d8c25ee3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6a1a016c-9e50-42fa-b8c2-6549cbf5c056"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "b36f9e15-db33-ef40-33b8-c68a9874a05e",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "75133de5-8863-49b0-9df5-06225cc9ce40"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "efe4a0bb-d3be-44cd-b96f-31887c507f67",
              "ParameterName": "Id",
              "DataSourceQueryID": "ae6d24bb-03cc-421a-a712-50ec77e6eaaa",
              "MappingFieldName": "Id",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "7b07589d-9dc5-43e2-bb30-7902a9e8f811",
          "ObjectID": null,
          "ObjectID_Tosave": "f23a6b47-8b0b-4fd0-9736-08c7c8670fc9",
          "QueryName": "Get_App_Environments_Sorted_By_Sequence",
          "DisplayName": "Get_App_Environments_Sorted_By_Sequence",
          "FilterLogic": "[1 AND [2]]",
          "Fields": [
            {
              "ID": "03433e2b-b591-430f-be02-056d7eaab6b4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ab4a0b92-4d97-4806-902c-645b13a3b41a"
            },
            {
              "ID": "9a704b86-0079-4375-9271-783b4f4158b8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1d746f3a-19f4-466a-893f-6fb336ac07cf"
            },
            {
              "ID": "7cd60bfa-7748-4655-b5b7-cecaf00ba482",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "75133de5-8863-49b0-9df5-06225cc9ce40"
            },
            {
              "ID": "4ead9d41-8243-4b41-96ec-ed6f5f2f9b1d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6a1a016c-9e50-42fa-b8c2-6549cbf5c056"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "6d4ffc9d-f1fe-eb41-73c0-be8540e48418",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "AppId",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "ab4a0b92-4d97-4806-902c-645b13a3b41a"
              },
              {
                "ID": "9708641f-2504-c0bf-6f29-d101469d17d8",
                "ConjuctionClause": 2,
                "RelationalOperator": 7,
                "ValueType": 0,
                "value": "",
                "Sequence": 1,
                "GroupID": 2,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "708099da-129b-4a77-8d4c-923b63cf1bd3"
              },
              {
                "ID": "929270c9-3b3f-386d-e2e3-2a33e0207827",
                "ConjuctionClause": 2,
                "RelationalOperator": 3,
                "ValueType": 1,
                "value": "1",
                "Sequence": 2,
                "GroupID": 2,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "6a1a016c-9e50-42fa-b8c2-6549cbf5c056"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [
            {
              "ID": "53e34e83-2b77-293e-7d94-7b0c12ca3e79",
              "SortSequence": 2,
              "Sequence": 1,
              "LookupDetails": null,
              "FieldType": 1,
              "AppFieldID": "6a1a016c-9e50-42fa-b8c2-6549cbf5c056"
            }
          ],
          "Parameters": [
            {
              "ID": "3ba8ac31-8414-4d7b-8048-fbc77333b816",
              "ParameterName": "AppId",
              "DataSourceQueryID": "7b07589d-9dc5-43e2-bb30-7902a9e8f811",
              "MappingFieldName": "AppId",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "5274b8b2-7122-4c6d-bbea-b31f0c8ed139",
          "ObjectID": null,
          "ObjectID_Tosave": "f23a6b47-8b0b-4fd0-9736-08c7c8670fc9",
          "QueryName": "List_TABMD_Environment",
          "DisplayName": "List_TABMD_Environment",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "0563f142-6650-4deb-90a8-01956b4e828c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "708099da-129b-4a77-8d4c-923b63cf1bd3"
            },
            {
              "ID": "e54d42ab-4f89-4a53-bb7f-996af2b8d408",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1d746f3a-19f4-466a-893f-6fb336ac07cf"
            },
            {
              "ID": "4d171e68-93eb-4d08-a31d-9c677924be51",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6a1a016c-9e50-42fa-b8c2-6549cbf5c056"
            },
            {
              "ID": "489ed43f-b6f2-47ec-9ae2-cca22f025d24",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "75133de5-8863-49b0-9df5-06225cc9ce40"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "66e910e3-ce20-9ccf-1271-ae0198d5b5bd",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "AppId",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "ab4a0b92-4d97-4806-902c-645b13a3b41a"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "2d962cd8-f2d0-4ec0-a253-4eb007fcbdf2",
              "ParameterName": "AppId",
              "DataSourceQueryID": "5274b8b2-7122-4c6d-bbea-b31f0c8ed139",
              "MappingFieldName": "AppId",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "699ccbdf-266c-415a-8235-e2bc92a85b71",
          "ObjectID": null,
          "ObjectID_Tosave": "f23a6b47-8b0b-4fd0-9736-08c7c8670fc9",
          "QueryName": "Get_App_SortedEnvironments",
          "DisplayName": "Get_App_SortedEnvironments",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "9aec3b0b-7197-46d1-830b-534f6d5c8240",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6a1a016c-9e50-42fa-b8c2-6549cbf5c056"
            },
            {
              "ID": "5e31cb84-fe49-4873-adc1-ceca5615caeb",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1d746f3a-19f4-466a-893f-6fb336ac07cf"
            },
            {
              "ID": "966b35d5-decb-4cd9-a464-d4c8bedd706f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "75133de5-8863-49b0-9df5-06225cc9ce40"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "66e910e3-ce20-9ccf-1271-ae0198d5b5bd",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "AppId",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "ab4a0b92-4d97-4806-902c-645b13a3b41a"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [
            {
              "ID": "450b847d-cf6d-83c8-6b87-89f3863429fd",
              "SortSequence": 2,
              "Sequence": 1,
              "LookupDetails": "Sequence",
              "FieldType": 1,
              "AppFieldID": "6a1a016c-9e50-42fa-b8c2-6549cbf5c056"
            }
          ],
          "Parameters": [
            {
              "ID": "41542d5f-9f71-4ae1-a3b1-6e79d0eeb174",
              "ParameterName": "AppId",
              "DataSourceQueryID": "699ccbdf-266c-415a-8235-e2bc92a85b71",
              "MappingFieldName": "AppId",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "7173a530-5797-4386-b096-e841c2c5879e",
          "ObjectID": null,
          "ObjectID_Tosave": "f23a6b47-8b0b-4fd0-9736-08c7c8670fc9",
          "QueryName": "Test_TABMD_Environment",
          "DisplayName": "Test_TABMD_Environment",
          "FilterLogic": null,
          "Fields": [],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "82cfaade-308e-441b-9df2-ec1a9abddd3b",
          "ObjectID": null,
          "ObjectID_Tosave": "f23a6b47-8b0b-4fd0-9736-08c7c8670fc9",
          "QueryName": "Default_TABMD_Environment",
          "DisplayName": "Default_TABMD_Environment",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "10112629-3fbf-4020-a875-39f8b120721d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ab4a0b92-4d97-4806-902c-645b13a3b41a"
            },
            {
              "ID": "f3392c7b-1dd0-4222-8f2a-6afe17169ac9",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "708099da-129b-4a77-8d4c-923b63cf1bd3"
            },
            {
              "ID": "5e3051a5-1b51-47f2-a4bf-8dffa4b2c3a8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "75133de5-8863-49b0-9df5-06225cc9ce40"
            },
            {
              "ID": "242e2c2b-30f5-441a-93f2-a5aea9622850",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6a1a016c-9e50-42fa-b8c2-6549cbf5c056"
            },
            {
              "ID": "0bb10714-d18b-4080-82a0-b67eb02d4265",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1d746f3a-19f4-466a-893f-6fb336ac07cf"
            },
            {
              "ID": "c2095c09-1209-479a-8b30-c46f54d91eff",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c83a2d34-7606-4cf1-90d9-2e5d2234a71d"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "e4ad1935-0e63-4ede-9e40-f5f34550d7d5",
          "ObjectID": null,
          "ObjectID_Tosave": "f23a6b47-8b0b-4fd0-9736-08c7c8670fc9",
          "QueryName": "DEV_TABMD_Environment",
          "DisplayName": "DEV_TABMD_Environment",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "74289e1e-4b2b-4eb2-8902-3a282868e452",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c83a2d34-7606-4cf1-90d9-2e5d2234a71d"
            },
            {
              "ID": "e15dfcf9-c98b-4248-ae63-56f7aec7b631",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6a1a016c-9e50-42fa-b8c2-6549cbf5c056"
            },
            {
              "ID": "6e4da6d4-7ebc-4c09-8246-6e19a6220762",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "708099da-129b-4a77-8d4c-923b63cf1bd3"
            },
            {
              "ID": "5994690a-1ab6-4fc3-bd62-70d4baf53e1f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1d746f3a-19f4-466a-893f-6fb336ac07cf"
            },
            {
              "ID": "3bb9d67b-c0dc-4353-acc2-aef1b1864e65",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "75133de5-8863-49b0-9df5-06225cc9ce40"
            },
            {
              "ID": "1b7b2dc4-c6ac-4e65-bc33-fd69c2b2166b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ab4a0b92-4d97-4806-902c-645b13a3b41a"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "TABMD_Environment",
      "Resources": null,
      "IsSystem": false,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "f23a6b47-8b0b-4fd0-9736-08c7c8670fc9",
      "AppObjectConfiguration": null,
      "AllowVersioning": false,
      "IsSupportBluePrint": null,
      "IsLocationTracking": null,
      "AllowSoftDelete": true,
      "IsReplicationNeeded": null,
      "IsCacheEnable": false,
      "CacheTtl": null,
      "ConnectionId": "8ccb12d3-3a42-4871-8494-1b541a796ca2",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "d052a189-a33f-4acd-8012-f66f9cc07cd3",
        "UpdatedBy": "d052a189-a33f-4acd-8012-f66f9cc07cd3",
        "CreatedOn": "2025-03-20T12:20:25.833",
        "UpdatedOn": "2025-05-15T08:02:23",
        "IsSystemRecord": null,
        "AppId": "92a3f57f-eb81-42d9-bcbb-dcaf9420d3d3"
      }
    },
    {
      "ID": "c575bb17-2bd4-4bfa-b3ec-10a9526d256f",
      "ObjectName": "AspNetRoleClaims",
      "DisplayName": "AspNetRoleClaims",
      "Description": "AspNetRoleClaims",
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": false,
      "DeploymentStatus": 2,
      "Fields": [
        {
          "ID": "c953a995-79e5-42a5-a403-2023ecae8248",
          "ObjectID": null,
          "ObjectID_Tosave": "c575bb17-2bd4-4bfa-b3ec-10a9526d256f",
          "FieldName": "ClaimValue",
          "DisplayName": "ClaimValue",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "ClaimValue",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "9e41b392-1948-409a-b055-8cbdfde319e7",
          "ObjectID": null,
          "ObjectID_Tosave": "c575bb17-2bd4-4bfa-b3ec-10a9526d256f",
          "FieldName": "ClaimType",
          "DisplayName": "ClaimType",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "ClaimType",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "62159d94-4530-4f46-9893-b853be7d2e4c",
          "ObjectID": null,
          "ObjectID_Tosave": "c575bb17-2bd4-4bfa-b3ec-10a9526d256f",
          "FieldName": "Id",
          "DisplayName": "Id",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Id",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "09b79089-be98-4f76-9ed5-ed0a272eae5e",
          "ObjectID": null,
          "ObjectID_Tosave": "c575bb17-2bd4-4bfa-b3ec-10a9526d256f",
          "FieldName": "RoleId",
          "DisplayName": "RoleId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RoleId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "e35e1e19-1bda-45d2-ba84-eeeac4edd2c6",
          "ObjectID": null,
          "ObjectID_Tosave": "c575bb17-2bd4-4bfa-b3ec-10a9526d256f",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "C575BB17-2BD4-4BFA-B3EC-10A9526D256F",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": null,
      "DataSourceQueries": [
        {
          "ID": "37babccc-8753-451c-ba83-02ecc5b1707b",
          "ObjectID": null,
          "ObjectID_Tosave": "c575bb17-2bd4-4bfa-b3ec-10a9526d256f",
          "QueryName": "FK_AspNetRoleClaims_AspNetRoles",
          "DisplayName": "FK_AspNetRoleClaims_AspNetRoles",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "f8988360-5611-4205-94b5-0b18d3c3eb02",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e35e1e19-1bda-45d2-ba84-eeeac4edd2c6"
            },
            {
              "ID": "a9305196-3383-4203-8fde-886431689f22",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9e41b392-1948-409a-b055-8cbdfde319e7"
            },
            {
              "ID": "944e9159-04ec-453f-911b-dbda3dac5b4f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "62159d94-4530-4f46-9893-b853be7d2e4c"
            },
            {
              "ID": "b6863b61-5d03-4425-a8fb-edad0dfb41dd",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c953a995-79e5-42a5-a403-2023ecae8248"
            },
            {
              "ID": "00e82e06-67af-4b9a-9cc9-ff518b2e82a3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "09b79089-be98-4f76-9ed5-ed0a272eae5e"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "b8a7ab4d-f559-4a16-8291-bce8ded23a7f",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "09b79089-be98-4f76-9ed5-ed0a272eae5e"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "c7adfb28-b86d-4ca0-ac68-f668a88cac26",
              "ParameterName": "Id",
              "DataSourceQueryID": "37babccc-8753-451c-ba83-02ecc5b1707b",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "0536eee2-97f8-4bc6-969c-332e32bf7afd",
          "ObjectID": null,
          "ObjectID_Tosave": "c575bb17-2bd4-4bfa-b3ec-10a9526d256f",
          "QueryName": "DEV_AspNetRoleClaims",
          "DisplayName": "DEV_AspNetRoleClaims",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "f00666d8-7f69-40df-9415-4c1492f36a93",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "62159d94-4530-4f46-9893-b853be7d2e4c"
            },
            {
              "ID": "0e0c7724-6705-4886-85e9-50c36316e1a1",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9e41b392-1948-409a-b055-8cbdfde319e7"
            },
            {
              "ID": "70cad7b1-f621-4cec-b7af-9f552507f210",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e35e1e19-1bda-45d2-ba84-eeeac4edd2c6"
            },
            {
              "ID": "a8fcb8c9-eb22-42ba-b44d-b42a2a244927",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c953a995-79e5-42a5-a403-2023ecae8248"
            },
            {
              "ID": "242861ce-1605-406e-8cc2-c781fa89ba1e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "09b79089-be98-4f76-9ed5-ed0a272eae5e"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "fd4afedb-9bd1-46cb-9c76-67d8c30180e7",
          "ObjectID": null,
          "ObjectID_Tosave": "c575bb17-2bd4-4bfa-b3ec-10a9526d256f",
          "QueryName": "List_AspNetRoleClaims",
          "DisplayName": "List_AspNetRoleClaims",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "bbd3bb98-340e-4071-8475-c364483153b6",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "62159d94-4530-4f46-9893-b853be7d2e4c"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "215c37b0-b7a3-424d-a542-a578eff66d78",
          "ObjectID": null,
          "ObjectID_Tosave": "c575bb17-2bd4-4bfa-b3ec-10a9526d256f",
          "QueryName": "Default_AspNetRoleClaims",
          "DisplayName": "Default_AspNetRoleClaims",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "7bd510be-1836-4b14-b777-37f61a21f13b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "09b79089-be98-4f76-9ed5-ed0a272eae5e"
            },
            {
              "ID": "5eaa46bc-26f3-46a0-aa2f-6c82903f7046",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9e41b392-1948-409a-b055-8cbdfde319e7"
            },
            {
              "ID": "c99ef848-c85e-430a-b391-83afba432608",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c953a995-79e5-42a5-a403-2023ecae8248"
            },
            {
              "ID": "36279d94-a85d-4676-8327-a282051a9542",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e35e1e19-1bda-45d2-ba84-eeeac4edd2c6"
            },
            {
              "ID": "cf7b8933-10a3-4a31-a7af-c2c7a79f4cdd",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "62159d94-4530-4f46-9893-b853be7d2e4c"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "a6a036e1-c09e-4543-8a7b-f9a52b77f52f",
          "ObjectID": null,
          "ObjectID_Tosave": "c575bb17-2bd4-4bfa-b3ec-10a9526d256f",
          "QueryName": "Detail_AspNetRoleClaims",
          "DisplayName": "Detail_AspNetRoleClaims",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "ad1db449-b093-44a5-ad51-56f3203493f8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "09b79089-be98-4f76-9ed5-ed0a272eae5e"
            },
            {
              "ID": "7211d665-9edf-43c4-ba39-9d11fbdac93b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c953a995-79e5-42a5-a403-2023ecae8248"
            },
            {
              "ID": "637c5129-2347-424a-8cc4-b86ed3d67ea7",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e35e1e19-1bda-45d2-ba84-eeeac4edd2c6"
            },
            {
              "ID": "7bbc6c2d-182a-49cd-bca7-ca91576590f7",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "62159d94-4530-4f46-9893-b853be7d2e4c"
            },
            {
              "ID": "fc69cc70-f40f-4190-b6aa-ea6832b98ab1",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9e41b392-1948-409a-b055-8cbdfde319e7"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "a37216dd-b444-441e-8100-f4a907986013",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "62159d94-4530-4f46-9893-b853be7d2e4c"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "73d6a853-3615-4995-a3c8-c7fd5971141e",
              "ParameterName": "Id",
              "DataSourceQueryID": "a6a036e1-c09e-4543-8a7b-f9a52b77f52f",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "AspNetRoleClaims",
      "Resources": null,
      "IsSystem": true,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "c575bb17-2bd4-4bfa-b3ec-10a9526d256f",
      "AppObjectConfiguration": null,
      "AllowVersioning": false,
      "IsSupportBluePrint": false,
      "IsLocationTracking": false,
      "AllowSoftDelete": false,
      "IsReplicationNeeded": false,
      "IsCacheEnable": false,
      "CacheTtl": 0,
      "ConnectionId": "8ccb12d3-3a42-4871-8494-1b541a796ca2",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "905a3188-6e49-43ec-9c91-9a9077da6594",
        "UpdatedBy": null,
        "CreatedOn": "2024-06-25T12:17:43.617",
        "UpdatedOn": null,
        "IsSystemRecord": false,
        "AppId": null
      }
    },
    {
      "ID": "52db0ddd-9102-4c1c-96cf-2c505756808a",
      "ObjectName": "AspNetRoles",
      "DisplayName": "AspNetRoles",
      "Description": "AspNetRoles",
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": false,
      "DeploymentStatus": 2,
      "Fields": [
        {
          "ID": "4b4fabe1-5bc7-4155-b4b1-0d2d32ddee08",
          "ObjectID": null,
          "ObjectID_Tosave": "52db0ddd-9102-4c1c-96cf-2c505756808a",
          "FieldName": "Name",
          "DisplayName": "Name",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Name",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "1e39e7c0-1909-4fc7-a63c-19c67f4ac3bc",
          "ObjectID": null,
          "ObjectID_Tosave": "52db0ddd-9102-4c1c-96cf-2c505756808a",
          "FieldName": "NormalizedName",
          "DisplayName": "NormalizedName",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "NormalizedName",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "413aa1a4-c54f-4d4a-a43e-22ea8dc599c2",
          "ObjectID": null,
          "ObjectID_Tosave": "52db0ddd-9102-4c1c-96cf-2c505756808a",
          "FieldName": "Description",
          "DisplayName": "Description",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Description",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "eeb2aa8c-f066-4e87-a469-969c66a94f66",
          "ObjectID": null,
          "ObjectID_Tosave": "52db0ddd-9102-4c1c-96cf-2c505756808a",
          "FieldName": "Id",
          "DisplayName": "Id",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Id",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "41287093-ab85-4276-ba91-aa5eca59b3d9",
          "ObjectID": null,
          "ObjectID_Tosave": "52db0ddd-9102-4c1c-96cf-2c505756808a",
          "FieldName": "ConcurrencyStamp",
          "DisplayName": "ConcurrencyStamp",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "ConcurrencyStamp",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "8b07b9d8-c8fc-48d6-a87d-b4802334559d",
          "ObjectID": null,
          "ObjectID_Tosave": "52db0ddd-9102-4c1c-96cf-2c505756808a",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "52DB0DDD-9102-4C1C-96CF-2C505756808A",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": [
        {
          "childDetails": {
            "LookupObject": "AspNetUserRoles",
            "LookupField": "RoleId",
            "DisplayField": null,
            "selectQuery": null
          },
          "LocalId": "Id"
        }
      ],
      "DataSourceQueries": [
        {
          "ID": "98346c84-d97d-41e3-b829-0658492a9540",
          "ObjectID": null,
          "ObjectID_Tosave": "52db0ddd-9102-4c1c-96cf-2c505756808a",
          "QueryName": "DEV_AspNetRoles",
          "DisplayName": "DEV_AspNetRoles",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "37b0c197-2de7-4607-be5a-6d2c2f880a64",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1e39e7c0-1909-4fc7-a63c-19c67f4ac3bc"
            },
            {
              "ID": "fad60b17-3dc6-47c0-9260-a0e12387b91a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "eeb2aa8c-f066-4e87-a469-969c66a94f66"
            },
            {
              "ID": "bdcff151-bb24-44b3-8972-ab293fa555f8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "41287093-ab85-4276-ba91-aa5eca59b3d9"
            },
            {
              "ID": "3dd0dda6-6928-4196-bbda-d55ff6cdeacd",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8b07b9d8-c8fc-48d6-a87d-b4802334559d"
            },
            {
              "ID": "b17f840d-a9d7-44cf-8ffb-d930d5f7e4b7",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "4b4fabe1-5bc7-4155-b4b1-0d2d32ddee08"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "40adcf18-b901-43b8-9857-302d967a6faa",
          "ObjectID": null,
          "ObjectID_Tosave": "52db0ddd-9102-4c1c-96cf-2c505756808a",
          "QueryName": "Appwise_AspNetRoles",
          "DisplayName": "Appwise_AspNetRoles",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "ed4bd89c-8e09-4406-b051-1e097af358f8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "eeb2aa8c-f066-4e87-a469-969c66a94f66"
            },
            {
              "ID": "7e3e3241-ba75-4f1f-9a64-2397b3242f3d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "4b4fabe1-5bc7-4155-b4b1-0d2d32ddee08"
            },
            {
              "ID": "78dd08b0-7167-4c46-9517-5cd292e583ec",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.AppId",
              "AppFieldID": "8451b996-3355-48d7-bb71-f0a0c8753308"
            },
            {
              "ID": "56647993-2560-48d7-87ce-baa71d398563",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.RecordId",
              "AppFieldID": "d3661c2c-e872-4f5a-9030-4c8f97c704c5"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "802ed30b-148b-c047-009f-91cf03dcaf77",
                "ConjuctionClause": 2,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "ApplicationId",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": "RecordInfo.AppId",
                "FieldType": 2,
                "FieldID": "8451b996-3355-48d7-bb71-f0a0c8753308"
              },
              {
                "ID": "802ed30b-148b-c047-009f-91cf03dcaf77",
                "ConjuctionClause": 2,
                "RelationalOperator": 6,
                "ValueType": 0,
                "value": "",
                "Sequence": 2,
                "GroupID": 1,
                "LookupDetail": "RecordInfo.AppId",
                "FieldType": 2,
                "FieldID": "8451b996-3355-48d7-bb71-f0a0c8753308"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "af1e692d-4ddb-4a08-9d02-9f86a7a33119",
              "ParameterName": "ApplicationId",
              "DataSourceQueryID": "40adcf18-b901-43b8-9857-302d967a6faa",
              "MappingFieldName": "ApplicationId",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "cc0650d3-5acd-408b-af3b-3734931eae3c",
          "ObjectID": null,
          "ObjectID_Tosave": "52db0ddd-9102-4c1c-96cf-2c505756808a",
          "QueryName": "List_AspNetRoles",
          "DisplayName": "List_AspNetRoles",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "30c37860-b62d-4a5d-9274-5e1ff6213975",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1e39e7c0-1909-4fc7-a63c-19c67f4ac3bc"
            },
            {
              "ID": "a2c7a1af-c2e4-40be-bebd-ba1d48c1c141",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "eeb2aa8c-f066-4e87-a469-969c66a94f66"
            },
            {
              "ID": "48edc45a-67e6-42e3-a787-c9c7856464a8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "4b4fabe1-5bc7-4155-b4b1-0d2d32ddee08"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "AppId",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": "RecordInfo.AppId",
                "FieldType": 2,
                "FieldID": "8451b996-3355-48d7-bb71-f0a0c8753308"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "92535ea3-5a31-4083-9f48-1c87a1225ea7",
              "ParameterName": "AppId",
              "DataSourceQueryID": "cc0650d3-5acd-408b-af3b-3734931eae3c",
              "MappingFieldName": "AppId",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "c92e0bb8-cb64-48a3-b45c-399d4f02e518",
          "ObjectID": null,
          "ObjectID_Tosave": "52db0ddd-9102-4c1c-96cf-2c505756808a",
          "QueryName": "Get_RoleDetail",
          "DisplayName": "Get_RoleDetail",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "c2a75c99-1d4f-4e83-8b8c-26b1364f37f9",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "4b4fabe1-5bc7-4155-b4b1-0d2d32ddee08"
            },
            {
              "ID": "246bea14-531a-43ca-8ec7-7297ac9ab34f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "eeb2aa8c-f066-4e87-a469-969c66a94f66"
            },
            {
              "ID": "316785df-2a26-4877-b9be-9191d65d3684",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 6,
              "FieldDetails": "#AspNetUserRoles:Get_UserRoles_Details_UserID",
              "AppFieldID": "18fd952c-f1dd-47cf-8381-5627c0375064"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "eeb2aa8c-f066-4e87-a469-969c66a94f66"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "10870bcc-c079-48ab-b383-12cc01f4ef96",
              "ParameterName": "Id",
              "DataSourceQueryID": "c92e0bb8-cb64-48a3-b45c-399d4f02e518",
              "MappingFieldName": "Id",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "0193a8f5-9978-4718-8304-4e7ff931fb7a",
          "ObjectID": null,
          "ObjectID_Tosave": "52db0ddd-9102-4c1c-96cf-2c505756808a",
          "QueryName": "WithoutOwnRole_AspNetRoles",
          "DisplayName": "WithoutOwnRole_AspNetRoles",
          "FilterLogic": null,
          "Fields": [],
          "Filters": {
            "Filters": [
              {
                "ID": "ccf7bbff-7bb9-4e23-a2b1-d4573a20ea85",
                "ConjuctionClause": 1,
                "RelationalOperator": 8,
                "ValueType": 2,
                "value": "RoleName",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "ed053922-fd13-4761-8c14-30f79b221c2a"
              },
              {
                "ID": "043df3a3-14e1-4f94-9bd2-ff1516d39762",
                "ConjuctionClause": 1,
                "RelationalOperator": 8,
                "ValueType": 1,
                "value": "Administrator",
                "Sequence": 2,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "ed053922-fd13-4761-8c14-30f79b221c2a"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "569e9938-008c-4d30-b0db-5092c651a257",
          "ObjectID": null,
          "ObjectID_Tosave": "52db0ddd-9102-4c1c-96cf-2c505756808a",
          "QueryName": "Default_AspNetRoles",
          "DisplayName": "Default_AspNetRoles",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "22e29f3a-0cd8-4cf2-8628-0312db4b6a66",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8b07b9d8-c8fc-48d6-a87d-b4802334559d"
            },
            {
              "ID": "b7b3fc38-0c1f-437a-b47f-360d30b3b6e5",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "41287093-ab85-4276-ba91-aa5eca59b3d9"
            },
            {
              "ID": "32081c4d-296f-4fce-9813-37b7da11a596",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "eeb2aa8c-f066-4e87-a469-969c66a94f66"
            },
            {
              "ID": "a6de95a7-de51-4a99-b247-91926d478030",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "4b4fabe1-5bc7-4155-b4b1-0d2d32ddee08"
            },
            {
              "ID": "aa26ffc5-2d87-40b8-b822-b44e64751fe3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1e39e7c0-1909-4fc7-a63c-19c67f4ac3bc"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "41033cfd-86e5-4c09-a378-6f5026a46bc5",
          "ObjectID": null,
          "ObjectID_Tosave": "52db0ddd-9102-4c1c-96cf-2c505756808a",
          "QueryName": "AspNetRoles_List",
          "DisplayName": "AspNetRoles_List",
          "FilterLogic": null,
          "Fields": [],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "e6e996fd-f10f-4acf-a663-72b40294ddc4",
          "ObjectID": null,
          "ObjectID_Tosave": "52db0ddd-9102-4c1c-96cf-2c505756808a",
          "QueryName": "List_AspNetRolesFilter",
          "DisplayName": "List_AspNetRolesFilter",
          "FilterLogic": null,
          "Fields": [],
          "Filters": {
            "Filters": [
              {
                "ID": "933434e8-60f5-45eb-94fb-903e6c250db4",
                "ConjuctionClause": 1,
                "RelationalOperator": 20,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "dbc58523-c102-45b0-8e28-36ed8b161c67"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "3e05ea82-8205-40bf-9033-f878aa9281ed",
          "ObjectID": null,
          "ObjectID_Tosave": "52db0ddd-9102-4c1c-96cf-2c505756808a",
          "QueryName": "Detail_AspNetRoles",
          "DisplayName": "Detail_AspNetRoles",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "c2dbad40-4bb6-4a9a-aaf2-0eba265d946a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1e39e7c0-1909-4fc7-a63c-19c67f4ac3bc"
            },
            {
              "ID": "24467438-ef6e-49a6-a5c6-61762cb87777",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "eeb2aa8c-f066-4e87-a469-969c66a94f66"
            },
            {
              "ID": "9491e2d0-a139-4e65-9c43-6c78d6f6cebe",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8b07b9d8-c8fc-48d6-a87d-b4802334559d"
            },
            {
              "ID": "51aecd0f-6a1d-446e-aa2f-903934e237cd",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "4b4fabe1-5bc7-4155-b4b1-0d2d32ddee08"
            },
            {
              "ID": "c28c6ff7-04b1-4753-b38d-c7455f5479b1",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "41287093-ab85-4276-ba91-aa5eca59b3d9"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "64fdc623-b28b-4ec3-acf5-843ad9845ea0",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "eeb2aa8c-f066-4e87-a469-969c66a94f66"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "e8dc487e-23e3-4a42-bd13-04942f0dc8e9",
              "ParameterName": "Id",
              "DataSourceQueryID": "3e05ea82-8205-40bf-9033-f878aa9281ed",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "AspNetRoles",
      "Resources": null,
      "IsSystem": true,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "52db0ddd-9102-4c1c-96cf-2c505756808a",
      "AppObjectConfiguration": null,
      "AllowVersioning": false,
      "IsSupportBluePrint": false,
      "IsLocationTracking": false,
      "AllowSoftDelete": false,
      "IsReplicationNeeded": true,
      "IsCacheEnable": false,
      "CacheTtl": 0,
      "ConnectionId": "8ccb12d3-3a42-4871-8494-1b541a796ca2",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "905a3188-6e49-43ec-9c91-9a9077da6594",
        "UpdatedBy": "d052a189-a33f-4acd-8012-f66f9cc07cd3",
        "CreatedOn": "2024-06-25T12:17:43.617",
        "UpdatedOn": "2025-05-21T10:03:23",
        "IsSystemRecord": true,
        "AppId": null
      }
    },
    {
      "ID": "999c5a60-fc61-4797-8e3e-413463dbfdbf",
      "ObjectName": "AspNetUserClaims",
      "DisplayName": "AspNetUserClaims",
      "Description": "AspNetUserClaims",
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": false,
      "DeploymentStatus": 2,
      "Fields": [
        {
          "ID": "7d51d0aa-7150-45f8-81c4-092cc1a409e3",
          "ObjectID": null,
          "ObjectID_Tosave": "999c5a60-fc61-4797-8e3e-413463dbfdbf",
          "FieldName": "ClaimType",
          "DisplayName": "ClaimType",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "ClaimType",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "9ce87ef4-6967-457d-97ce-450fd8b001fe",
          "ObjectID": null,
          "ObjectID_Tosave": "999c5a60-fc61-4797-8e3e-413463dbfdbf",
          "FieldName": "ClaimValue",
          "DisplayName": "ClaimValue",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "ClaimValue",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "08473413-177f-4fbe-af83-57202351f0be",
          "ObjectID": null,
          "ObjectID_Tosave": "999c5a60-fc61-4797-8e3e-413463dbfdbf",
          "FieldName": "UserId",
          "DisplayName": "UserId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "UserId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "1d519ec5-106e-4bdd-8248-7709d7010d08",
          "ObjectID": null,
          "ObjectID_Tosave": "999c5a60-fc61-4797-8e3e-413463dbfdbf",
          "FieldName": "Id",
          "DisplayName": "Id",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Id",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "584e2715-4488-4b10-9ce0-834b275954a7",
          "ObjectID": null,
          "ObjectID_Tosave": "999c5a60-fc61-4797-8e3e-413463dbfdbf",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "999C5A60-FC61-4797-8E3E-413463DBFDBF",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": null,
      "DataSourceQueries": [
        {
          "ID": "60073bdc-eca7-4e45-8dc2-007567e9f897",
          "ObjectID": null,
          "ObjectID_Tosave": "999c5a60-fc61-4797-8e3e-413463dbfdbf",
          "QueryName": "List_AspNetUserClaims",
          "DisplayName": "List_AspNetUserClaims",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "0520a71a-a143-49aa-bcfd-200e16004b02",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1d519ec5-106e-4bdd-8248-7709d7010d08"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "fab8072a-df3a-453c-96ec-3e4b6ccd22ad",
          "ObjectID": null,
          "ObjectID_Tosave": "999c5a60-fc61-4797-8e3e-413463dbfdbf",
          "QueryName": "Detail_AspNetUserClaims",
          "DisplayName": "Detail_AspNetUserClaims",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "549f7eac-4f9a-4cc2-bf27-1094b64a07ff",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9ce87ef4-6967-457d-97ce-450fd8b001fe"
            },
            {
              "ID": "3844baf3-d21d-4445-889d-1458309cf3ea",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "7d51d0aa-7150-45f8-81c4-092cc1a409e3"
            },
            {
              "ID": "fe0dbd7d-8002-487c-ba2f-21bc29233409",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "08473413-177f-4fbe-af83-57202351f0be"
            },
            {
              "ID": "69c70cb8-c497-411e-a9ca-3e76f7aac518",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "584e2715-4488-4b10-9ce0-834b275954a7"
            },
            {
              "ID": "768062d2-9a13-479d-97b1-e5d7706e32f2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1d519ec5-106e-4bdd-8248-7709d7010d08"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "40f87c61-0a26-40e9-bdeb-d0fd06538670",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "1d519ec5-106e-4bdd-8248-7709d7010d08"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "7c516851-339a-4f5e-a12c-77db26d5cc26",
              "ParameterName": "Id",
              "DataSourceQueryID": "fab8072a-df3a-453c-96ec-3e4b6ccd22ad",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "60ecfeaf-37c7-4fab-b039-46e4deaa1fbd",
          "ObjectID": null,
          "ObjectID_Tosave": "999c5a60-fc61-4797-8e3e-413463dbfdbf",
          "QueryName": "FK_AspNetUserClaims_AspNetUsers",
          "DisplayName": "FK_AspNetUserClaims_AspNetUsers",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "46f6c598-9038-4306-903a-2d11a49072b0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "584e2715-4488-4b10-9ce0-834b275954a7"
            },
            {
              "ID": "09731392-d885-4483-90ea-3651325344c3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1d519ec5-106e-4bdd-8248-7709d7010d08"
            },
            {
              "ID": "3abaa658-03de-4cf8-b4b0-5fd93bf01bdc",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "08473413-177f-4fbe-af83-57202351f0be"
            },
            {
              "ID": "804a239b-eefa-4006-a2f3-c31991d14e57",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "7d51d0aa-7150-45f8-81c4-092cc1a409e3"
            },
            {
              "ID": "f33818c8-cd69-4b28-ac6b-fcebaf775373",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9ce87ef4-6967-457d-97ce-450fd8b001fe"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "7badf6bb-5eec-4a7f-a24c-d042d78704a0",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "08473413-177f-4fbe-af83-57202351f0be"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "41aca74e-3244-4274-b287-16a589bb44a8",
              "ParameterName": "Id",
              "DataSourceQueryID": "60ecfeaf-37c7-4fab-b039-46e4deaa1fbd",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "c58253bd-ad37-4971-a964-aca30b97d24e",
          "ObjectID": null,
          "ObjectID_Tosave": "999c5a60-fc61-4797-8e3e-413463dbfdbf",
          "QueryName": "DEV_AspNetUserClaims",
          "DisplayName": "DEV_AspNetUserClaims",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "a81090e4-122a-43c4-9899-01830c2203b0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "08473413-177f-4fbe-af83-57202351f0be"
            },
            {
              "ID": "db2ad9d7-3df7-4a7e-b80c-450227c54f5c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9ce87ef4-6967-457d-97ce-450fd8b001fe"
            },
            {
              "ID": "48b3076b-3cd2-4da6-84af-6620a8b68066",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1d519ec5-106e-4bdd-8248-7709d7010d08"
            },
            {
              "ID": "2978fec9-3dee-492e-ba42-83bec11f484c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "7d51d0aa-7150-45f8-81c4-092cc1a409e3"
            },
            {
              "ID": "19936b24-6d8c-4e32-b5a3-9b84e3ef9396",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "584e2715-4488-4b10-9ce0-834b275954a7"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "2745fd4b-d986-4a87-997c-bbe3e1ea927f",
          "ObjectID": null,
          "ObjectID_Tosave": "999c5a60-fc61-4797-8e3e-413463dbfdbf",
          "QueryName": "Default_AspNetUserClaims",
          "DisplayName": "Default_AspNetUserClaims",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "817faa92-ab79-4c58-ae02-16858e2e22ff",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9ce87ef4-6967-457d-97ce-450fd8b001fe"
            },
            {
              "ID": "33263803-d7a9-4fab-97b2-17e633819e21",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "08473413-177f-4fbe-af83-57202351f0be"
            },
            {
              "ID": "eeb4aa75-7e78-4e94-9569-c7fc082fff80",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "7d51d0aa-7150-45f8-81c4-092cc1a409e3"
            },
            {
              "ID": "7d06f0bb-6072-455e-92e3-dc9d84201341",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "584e2715-4488-4b10-9ce0-834b275954a7"
            },
            {
              "ID": "65157cb8-8b1c-4aae-951f-f7165e69f75e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1d519ec5-106e-4bdd-8248-7709d7010d08"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "AspNetUserClaims",
      "Resources": null,
      "IsSystem": true,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "999c5a60-fc61-4797-8e3e-413463dbfdbf",
      "AppObjectConfiguration": null,
      "AllowVersioning": false,
      "IsSupportBluePrint": false,
      "IsLocationTracking": false,
      "AllowSoftDelete": false,
      "IsReplicationNeeded": false,
      "IsCacheEnable": false,
      "CacheTtl": 0,
      "ConnectionId": "8ccb12d3-3a42-4871-8494-1b541a796ca2",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "905a3188-6e49-43ec-9c91-9a9077da6594",
        "UpdatedBy": null,
        "CreatedOn": "2024-06-25T12:17:43.617",
        "UpdatedOn": null,
        "IsSystemRecord": false,
        "AppId": null
      }
    },
    {
      "ID": "e7b84b49-d313-4037-9c3d-d9cc13ac0ec8",
      "ObjectName": "AspNetUserLogins",
      "DisplayName": "AspNetUserLogins",
      "Description": "AspNetUserLogins",
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": false,
      "DeploymentStatus": 2,
      "Fields": [
        {
          "ID": "60a1ba5c-4dd4-425b-b4fb-215d3d1cd14f",
          "ObjectID": null,
          "ObjectID_Tosave": "e7b84b49-d313-4037-9c3d-d9cc13ac0ec8",
          "FieldName": "UserId",
          "DisplayName": "UserId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "UserId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "80e3dfd2-19a6-4890-8502-3f897ec6d6df",
          "ObjectID": null,
          "ObjectID_Tosave": "e7b84b49-d313-4037-9c3d-d9cc13ac0ec8",
          "FieldName": "ProviderDisplayName",
          "DisplayName": "ProviderDisplayName",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "ProviderDisplayName",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "c56e7e1f-f867-42e9-8d6e-7bd294b46f56",
          "ObjectID": null,
          "ObjectID_Tosave": "e7b84b49-d313-4037-9c3d-d9cc13ac0ec8",
          "FieldName": "LoginProvider",
          "DisplayName": "LoginProvider",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "LoginProvider",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "ebb35570-ec90-422b-97be-da6dbfda8511",
          "ObjectID": null,
          "ObjectID_Tosave": "e7b84b49-d313-4037-9c3d-d9cc13ac0ec8",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "E7B84B49-D313-4037-9C3D-D9CC13AC0EC8",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "74d73a79-4587-412f-88f1-da75954408b7",
          "ObjectID": null,
          "ObjectID_Tosave": "e7b84b49-d313-4037-9c3d-d9cc13ac0ec8",
          "FieldName": "ProviderKey",
          "DisplayName": "ProviderKey",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "ProviderKey",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": null,
      "DataSourceQueries": [
        {
          "ID": "cfa8fdf3-740e-4ec6-be7c-147b0d3832a3",
          "ObjectID": null,
          "ObjectID_Tosave": "e7b84b49-d313-4037-9c3d-d9cc13ac0ec8",
          "QueryName": "Detail_AspNetUserLogins",
          "DisplayName": "Detail_AspNetUserLogins",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "c9b1e069-2a59-448e-b072-0040b478c1bd",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "74d73a79-4587-412f-88f1-da75954408b7"
            },
            {
              "ID": "ecb6bbbc-cdb6-473a-bf8d-0a0ab9a78fbc",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "80e3dfd2-19a6-4890-8502-3f897ec6d6df"
            },
            {
              "ID": "80ba83bf-4f73-4535-8740-8f365cc59425",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "60a1ba5c-4dd4-425b-b4fb-215d3d1cd14f"
            },
            {
              "ID": "698a1b53-fdb8-4877-8d90-b6c138b2c9d8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c56e7e1f-f867-42e9-8d6e-7bd294b46f56"
            },
            {
              "ID": "6daba498-f1cb-4e4e-bc7c-eda3b6001703",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ebb35570-ec90-422b-97be-da6dbfda8511"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "4e952652-555c-44e6-974c-463c2eb05371",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "LoginProvider",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "c56e7e1f-f867-42e9-8d6e-7bd294b46f56"
              },
              {
                "ID": "cc3a9fb5-fd58-4327-b2a5-a14bc6d79ddf",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "ProviderKey",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "74d73a79-4587-412f-88f1-da75954408b7"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "31f671d7-2ca8-440c-93de-5472e993c2ef",
              "ParameterName": "LoginProvider",
              "DataSourceQueryID": "cfa8fdf3-740e-4ec6-be7c-147b0d3832a3",
              "MappingFieldName": "LoginProvider",
              "IsMandatory": false
            },
            {
              "ID": "c5d199d4-9dfc-42ce-8ad5-fc597a91e2bf",
              "ParameterName": "ProviderKey",
              "DataSourceQueryID": "cfa8fdf3-740e-4ec6-be7c-147b0d3832a3",
              "MappingFieldName": "ProviderKey",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "0183b9b1-fc0a-4374-92c0-72b2e40c8815",
          "ObjectID": null,
          "ObjectID_Tosave": "e7b84b49-d313-4037-9c3d-d9cc13ac0ec8",
          "QueryName": "List_AspNetUserLogins",
          "DisplayName": "List_AspNetUserLogins",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "9ee447e0-42a9-43a0-83e1-051b63f87d83",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "74d73a79-4587-412f-88f1-da75954408b7"
            },
            {
              "ID": "a3526409-da1d-47f4-87c4-2bff0d23dc3b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "80e3dfd2-19a6-4890-8502-3f897ec6d6df"
            },
            {
              "ID": "8338262a-a9de-4320-b15c-48d42bf25f86",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c56e7e1f-f867-42e9-8d6e-7bd294b46f56"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "50dfa3db-8c7a-4f4f-8bd6-880871120220",
          "ObjectID": null,
          "ObjectID_Tosave": "e7b84b49-d313-4037-9c3d-d9cc13ac0ec8",
          "QueryName": "Default_AspNetUserLogins",
          "DisplayName": "Default_AspNetUserLogins",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "c163201a-00c2-405f-ad8f-2c56bbba9e64",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "80e3dfd2-19a6-4890-8502-3f897ec6d6df"
            },
            {
              "ID": "04ca480e-fe1f-4e00-be3f-717196242257",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "74d73a79-4587-412f-88f1-da75954408b7"
            },
            {
              "ID": "ceb8f7e6-4f5a-47e6-8f48-912feb38cc1b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "60a1ba5c-4dd4-425b-b4fb-215d3d1cd14f"
            },
            {
              "ID": "9602063e-b90e-4703-a0dd-b118ff6482b2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ebb35570-ec90-422b-97be-da6dbfda8511"
            },
            {
              "ID": "dfac718b-ed8c-482b-a267-b755b6d659e4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c56e7e1f-f867-42e9-8d6e-7bd294b46f56"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "9c086c2c-5d3a-4f99-99de-9132cfc59142",
          "ObjectID": null,
          "ObjectID_Tosave": "e7b84b49-d313-4037-9c3d-d9cc13ac0ec8",
          "QueryName": "DEV_AspNetUserLogins",
          "DisplayName": "DEV_AspNetUserLogins",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "e30c39f9-a3f9-44b9-b8b0-51608fabe4d4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "60a1ba5c-4dd4-425b-b4fb-215d3d1cd14f"
            },
            {
              "ID": "63e92dcc-080a-4598-a088-75e3ebd0ceb0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "80e3dfd2-19a6-4890-8502-3f897ec6d6df"
            },
            {
              "ID": "2a343860-1dae-4748-94b3-d7fefa136007",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "74d73a79-4587-412f-88f1-da75954408b7"
            },
            {
              "ID": "d1612295-f82f-49e1-b9df-f49a65beaff8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ebb35570-ec90-422b-97be-da6dbfda8511"
            },
            {
              "ID": "e4b9c29e-4026-4c46-9fd7-f739dc401bd7",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c56e7e1f-f867-42e9-8d6e-7bd294b46f56"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "be78d511-dcc9-4499-be54-a3793670ba49",
          "ObjectID": null,
          "ObjectID_Tosave": "e7b84b49-d313-4037-9c3d-d9cc13ac0ec8",
          "QueryName": "FK_AspNetUserLogins_AspNetUsers",
          "DisplayName": "FK_AspNetUserLogins_AspNetUsers",
          "FilterLogic": null,
          "Fields": [],
          "Filters": {
            "Filters": [
              {
                "ID": "86e48c71-547b-40a9-9af2-f90730b72223",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "c4ab361b-3a75-42d5-b50f-f51f955a1b82"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "AspNetUserLogins",
      "Resources": null,
      "IsSystem": true,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "e7b84b49-d313-4037-9c3d-d9cc13ac0ec8",
      "AppObjectConfiguration": null,
      "AllowVersioning": false,
      "IsSupportBluePrint": false,
      "IsLocationTracking": false,
      "AllowSoftDelete": false,
      "IsReplicationNeeded": false,
      "IsCacheEnable": false,
      "CacheTtl": 0,
      "ConnectionId": "8ccb12d3-3a42-4871-8494-1b541a796ca2",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "905a3188-6e49-43ec-9c91-9a9077da6594",
        "UpdatedBy": null,
        "CreatedOn": "2024-06-25T12:17:43.617",
        "UpdatedOn": null,
        "IsSystemRecord": false,
        "AppId": null
      }
    },
    {
      "ID": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
      "ObjectName": "AspNetUserRoles",
      "DisplayName": "AspNetUserRoles",
      "Description": "AspNetUserRoles",
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": false,
      "DeploymentStatus": 2,
      "Fields": [
        {
          "ID": "54e61407-f803-43b2-adf0-51d5f9cb65c8",
          "ObjectID": null,
          "ObjectID_Tosave": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
          "FieldName": "Id",
          "DisplayName": "Id",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Id",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "11112307-32f8-4432-a880-5fccd88a19f5",
          "ObjectID": null,
          "ObjectID_Tosave": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
          "FieldName": "RoleId",
          "DisplayName": "RoleId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RoleId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "AspNetRoles",
            "LookupField": "Id",
            "DisplayField": "Id",
            "selectQuery": null
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "e35669cd-63ac-4c5f-a6dc-795be2154984",
          "ObjectID": null,
          "ObjectID_Tosave": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
          "FieldName": "UserId",
          "DisplayName": "UserId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "UserId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "05d1effe-01f4-4522-bdcd-df3ca83d6e73",
          "ObjectID": null,
          "ObjectID_Tosave": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "B054B76F-44B3-415C-83E1-A89DBE5EDE10",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": null,
      "DataSourceQueries": [
        {
          "ID": "58515f05-1fc5-452e-af59-3e8efc15fbe4",
          "ObjectID": null,
          "ObjectID_Tosave": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
          "QueryName": "Tenant_App_Wise_AspNetUserRoles",
          "DisplayName": "Tenant_App_Wise_AspNetUserRoles",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "78b42e22-514b-495c-bc37-1204d6b0da04",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.AppId",
              "AppFieldID": "8451b996-3355-48d7-bb71-f0a0c8753308"
            },
            {
              "ID": "32499041-ad4c-48c6-9e7f-60112c41ff5b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RoleId.Id",
              "AppFieldID": "eeb2aa8c-f066-4e87-a469-969c66a94f66"
            },
            {
              "ID": "50fa01ee-af75-499d-b22e-6c4d8eca7178",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RoleId.Name",
              "AppFieldID": "4b4fabe1-5bc7-4155-b4b1-0d2d32ddee08"
            },
            {
              "ID": "532f386d-b85a-4d6a-ac1d-be788877c6cc",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RoleId.Description",
              "AppFieldID": "413aa1a4-c54f-4d4a-a43e-22ea8dc599c2"
            },
            {
              "ID": "5744a5f3-b3cf-4bc9-897f-c55e980fc34d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "54e61407-f803-43b2-adf0-51d5f9cb65c8"
            },
            {
              "ID": "6a35b5d6-921b-4e14-9930-cba392c7380c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.TenantId",
              "AppFieldID": "f9a5bee3-f20c-47db-bbd4-ac0d972985f5"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "UserId",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "e35669cd-63ac-4c5f-a6dc-795be2154984"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "6b2f9db7-c906-492d-a840-5ebb315d2ce2",
              "ParameterName": "UserId",
              "DataSourceQueryID": "58515f05-1fc5-452e-af59-3e8efc15fbe4",
              "MappingFieldName": "UserId",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "defb562d-67a2-4249-a7a5-63d4b3293464",
          "ObjectID": null,
          "ObjectID_Tosave": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
          "QueryName": "FK_AspNetUserRoles_AspNetRoles",
          "DisplayName": "FK_AspNetUserRoles_AspNetRoles",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "bf90afe9-fca5-4204-b6c7-62c6ba1a1ab1",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "11112307-32f8-4432-a880-5fccd88a19f5"
            },
            {
              "ID": "74cc8c15-50a9-4b6f-aeca-7ea67208ec4b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "54e61407-f803-43b2-adf0-51d5f9cb65c8"
            },
            {
              "ID": "a230135b-f54a-4a25-8993-bbcda3989313",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e35669cd-63ac-4c5f-a6dc-795be2154984"
            },
            {
              "ID": "5d3c2f29-1c46-4466-bf86-f8248d6cd5a1",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "05d1effe-01f4-4522-bdcd-df3ca83d6e73"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "8ad55191-8a29-4f7a-8eab-ab2c904564b1",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "11112307-32f8-4432-a880-5fccd88a19f5"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "a3b90d29-b90b-45d8-a012-31783456936f",
              "ParameterName": "Id",
              "DataSourceQueryID": "defb562d-67a2-4249-a7a5-63d4b3293464",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "14108f7e-663e-4f46-9807-6620ce6ecf2a",
          "ObjectID": null,
          "ObjectID_Tosave": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
          "QueryName": "Get_TenantWise_UserRoles",
          "DisplayName": "Get_TenantWise_UserRoles",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "5bd00ba6-c5a7-41c9-9af7-01f86a2a598b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.AppId",
              "AppFieldID": "8451b996-3355-48d7-bb71-f0a0c8753308"
            },
            {
              "ID": "89258423-c520-4859-907e-0538e9879ab1",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.AppEnvironmentId",
              "AppFieldID": "6a57e1dc-fd38-477a-a446-13b9a662df35"
            },
            {
              "ID": "8159a599-90ef-4d36-80dd-620d166d316e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "54e61407-f803-43b2-adf0-51d5f9cb65c8"
            },
            {
              "ID": "fc365686-48a6-4ffc-8fb5-7b64d49cfc63",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "11112307-32f8-4432-a880-5fccd88a19f5"
            },
            {
              "ID": "899dbae2-f4d6-42b3-b412-a2d3de5a6a8c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e35669cd-63ac-4c5f-a6dc-795be2154984"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "TenantId",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": "RecordInfo.TenantId",
                "FieldType": 2,
                "FieldID": "f9a5bee3-f20c-47db-bbd4-ac0d972985f5"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "d4ee33e7-a09b-4ea0-a6e6-1bf2446908d5",
              "ParameterName": "TenantId",
              "DataSourceQueryID": "14108f7e-663e-4f46-9807-6620ce6ecf2a",
              "MappingFieldName": "TenantId",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "b3deb1d5-180d-4288-9ab5-74c8da86d7d1",
          "ObjectID": null,
          "ObjectID_Tosave": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
          "QueryName": "UserRoles_AspNetUserRoles",
          "DisplayName": "UserRoles_AspNetUserRoles",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "7614323c-efad-4050-9a5b-443972c3c846",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "54e61407-f803-43b2-adf0-51d5f9cb65c8"
            },
            {
              "ID": "5159cd67-c920-434e-95c7-60f9abeca7c6",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "UserId.Id",
              "AppFieldID": "ec3faaf7-8ca1-401b-b615-5647a5b4d3c2"
            },
            {
              "ID": "66aeedac-e124-439c-b7d8-6e0ddfda056e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "11112307-32f8-4432-a880-5fccd88a19f5"
            },
            {
              "ID": "dd689347-50f5-4fad-8b30-a08e0a587c4b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "UserId.Email",
              "AppFieldID": "9ef91253-0e65-447c-a3a6-784ded5e4391"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "11112307-32f8-4432-a880-5fccd88a19f5"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "c9f1b930-76c7-44a0-a677-856dfb83d77a",
              "ParameterName": "Id",
              "DataSourceQueryID": "b3deb1d5-180d-4288-9ab5-74c8da86d7d1",
              "MappingFieldName": "Id",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "483740a9-6a18-4c74-a55d-a3073679788c",
          "ObjectID": null,
          "ObjectID_Tosave": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
          "QueryName": "WithRoleName_AspNetUserRoles",
          "DisplayName": "WithRoleName_AspNetUserRoles",
          "FilterLogic": null,
          "Fields": [],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "e01dc049-db8f-4d1b-ae76-b4674295c7b2",
          "ObjectID": null,
          "ObjectID_Tosave": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
          "QueryName": "List_AspNetUserRoles",
          "DisplayName": "List_AspNetUserRoles",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "8b69d72f-5730-4532-b365-70e46fd79dd8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RoleId.Id",
              "AppFieldID": "eeb2aa8c-f066-4e87-a469-969c66a94f66"
            },
            {
              "ID": "312d73a4-5e45-495c-bc99-bd2beec1743f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "54e61407-f803-43b2-adf0-51d5f9cb65c8"
            },
            {
              "ID": "6c6e2ac2-858b-4b63-8154-eba1cf2a3e68",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RoleId.Name",
              "AppFieldID": "4b4fabe1-5bc7-4155-b4b1-0d2d32ddee08"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "6644cf2d-f41c-41cd-a73d-b4b8e1f2697a",
          "ObjectID": null,
          "ObjectID_Tosave": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
          "QueryName": "DEV_AspNetUserRoles",
          "DisplayName": "DEV_AspNetUserRoles",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "e3d09c66-edfb-400b-abf1-5a02968a3b9c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e35669cd-63ac-4c5f-a6dc-795be2154984"
            },
            {
              "ID": "a2cb34ce-334f-422f-a71c-6f17bf69e415",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "05d1effe-01f4-4522-bdcd-df3ca83d6e73"
            },
            {
              "ID": "c3ecd337-fa03-4950-9de5-836632faf870",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "11112307-32f8-4432-a880-5fccd88a19f5"
            },
            {
              "ID": "5a5ebc29-0b17-4636-a241-cd7ddd99cbce",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "54e61407-f803-43b2-adf0-51d5f9cb65c8"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "5bc11d1c-fc33-4a16-9913-b625c81c8fea",
          "ObjectID": null,
          "ObjectID_Tosave": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
          "QueryName": "FK_AspNetUserRoles_AspNetUsers",
          "DisplayName": "FK_AspNetUserRoles_AspNetUsers",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "104673c4-a88d-4e23-b420-5592334261c4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "05d1effe-01f4-4522-bdcd-df3ca83d6e73"
            },
            {
              "ID": "69bc2a3e-cb7d-4d12-84d4-966b45b00e04",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e35669cd-63ac-4c5f-a6dc-795be2154984"
            },
            {
              "ID": "1348645b-d221-4cce-8999-a14db9e1adc2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "54e61407-f803-43b2-adf0-51d5f9cb65c8"
            },
            {
              "ID": "d4637e96-acd5-4193-98fb-a5a09689a9ce",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "11112307-32f8-4432-a880-5fccd88a19f5"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "54f7d1d4-36ab-4a9d-8e79-416e60bb6c81",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "e35669cd-63ac-4c5f-a6dc-795be2154984"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "9cbb0f64-0489-4bb5-9a64-09a66c8864bc",
              "ParameterName": "Id",
              "DataSourceQueryID": "5bc11d1c-fc33-4a16-9913-b625c81c8fea",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "1f8a410e-3ae8-498c-a9c4-be88390a1db9",
          "ObjectID": null,
          "ObjectID_Tosave": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
          "QueryName": "Detail_AspNetUserRoles",
          "DisplayName": "Detail_AspNetUserRoles",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "27e9507a-f1f9-4ae0-bdd8-73c28b36c44e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "11112307-32f8-4432-a880-5fccd88a19f5"
            },
            {
              "ID": "8eaef4b4-685b-4cb5-8983-7c82e4f563cc",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "54e61407-f803-43b2-adf0-51d5f9cb65c8"
            },
            {
              "ID": "cd271495-4180-4e44-8cbd-8d6aab100eb2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "05d1effe-01f4-4522-bdcd-df3ca83d6e73"
            },
            {
              "ID": "b6a46e36-c10b-4af8-a07d-8f9dff2a52ac",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e35669cd-63ac-4c5f-a6dc-795be2154984"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "49964cd1-316f-47d2-af06-be1459bef47b",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "54e61407-f803-43b2-adf0-51d5f9cb65c8"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "f0af8444-b841-4532-bef4-abbd8bcfd581",
              "ParameterName": "Id",
              "DataSourceQueryID": "1f8a410e-3ae8-498c-a9c4-be88390a1db9",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "ac61c225-8819-4ca8-a9c6-cca7ae22154d",
          "ObjectID": null,
          "ObjectID_Tosave": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
          "QueryName": "Default_AspNetUserRoles",
          "DisplayName": "Default_AspNetUserRoles",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "46c61bac-428c-4f7f-bc68-229669fd4982",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "54e61407-f803-43b2-adf0-51d5f9cb65c8"
            },
            {
              "ID": "2a135de9-606c-4260-8c75-8c815d08df0f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e35669cd-63ac-4c5f-a6dc-795be2154984"
            },
            {
              "ID": "c9c1b9c0-5d9d-4d58-a7de-b21927a06d03",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "11112307-32f8-4432-a880-5fccd88a19f5"
            },
            {
              "ID": "5e524d08-777f-4351-9571-e0629eca24ac",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "05d1effe-01f4-4522-bdcd-df3ca83d6e73"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "eeb4e6bd-cee5-4e19-89bb-d2d30cc680a9",
          "ObjectID": null,
          "ObjectID_Tosave": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
          "QueryName": "Get_UserRoles_Details_UserID",
          "DisplayName": "Get_UserRoles_Details_UserID",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "c2cce23c-93f2-4262-a0ef-447fbcc53778",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "11112307-32f8-4432-a880-5fccd88a19f5"
            },
            {
              "ID": "b2d41ed8-270d-49d8-af84-ea28a693558d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e35669cd-63ac-4c5f-a6dc-795be2154984"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "TenantId",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": "RecordInfo.TenantId",
                "FieldType": 2,
                "FieldID": "f9a5bee3-f20c-47db-bbd4-ac0d972985f5"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "0ad8a63f-71d1-43b5-9be6-8c1cb10c702f",
              "ParameterName": "TenantId",
              "DataSourceQueryID": "eeb4e6bd-cee5-4e19-89bb-d2d30cc680a9",
              "MappingFieldName": "TenantId",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "d0821534-5b8d-4c49-b188-e72ba00f9a12",
          "ObjectID": null,
          "ObjectID_Tosave": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
          "QueryName": "Get_TenantApp_WiseUserRoles",
          "DisplayName": "Get_TenantApp_WiseUserRoles",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "dae3b0c6-d8d4-4abc-85d9-17c5375949af",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.TenantId",
              "AppFieldID": "f9a5bee3-f20c-47db-bbd4-ac0d972985f5"
            },
            {
              "ID": "5c81f366-e7b2-46f2-b0bc-23576cc46006",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RoleId.Name",
              "AppFieldID": "4b4fabe1-5bc7-4155-b4b1-0d2d32ddee08"
            },
            {
              "ID": "0d6a34f1-8891-49eb-adef-42eb5a210191",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "54e61407-f803-43b2-adf0-51d5f9cb65c8"
            },
            {
              "ID": "51fb8a57-0884-4e85-a315-8c2a99b26373",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RoleId.Id",
              "AppFieldID": "eeb2aa8c-f066-4e87-a469-969c66a94f66"
            },
            {
              "ID": "d8e14a53-5c7a-42bb-b57a-e43553a161c3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.AppId",
              "AppFieldID": "8451b996-3355-48d7-bb71-f0a0c8753308"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "UserId",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "e35669cd-63ac-4c5f-a6dc-795be2154984"
              },
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "AppId",
                "Sequence": 2,
                "GroupID": 1,
                "LookupDetail": "RecordInfo.AppId",
                "FieldType": 2,
                "FieldID": "8451b996-3355-48d7-bb71-f0a0c8753308"
              },
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "TenantId",
                "Sequence": 3,
                "GroupID": 1,
                "LookupDetail": "RecordInfo.TenantId",
                "FieldType": 2,
                "FieldID": "f9a5bee3-f20c-47db-bbd4-ac0d972985f5"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "49dde9f6-1843-4d8a-a4b0-c0334ee0a0b7",
              "ParameterName": "TenantId",
              "DataSourceQueryID": "d0821534-5b8d-4c49-b188-e72ba00f9a12",
              "MappingFieldName": "TenantId",
              "IsMandatory": true
            },
            {
              "ID": "0467619b-b8d3-4e83-81a7-d71d05ab4fe3",
              "ParameterName": "UserId",
              "DataSourceQueryID": "d0821534-5b8d-4c49-b188-e72ba00f9a12",
              "MappingFieldName": "UserId",
              "IsMandatory": true
            },
            {
              "ID": "50fd0cbf-e793-477a-9178-e1f363efcfc2",
              "ParameterName": "AppId",
              "DataSourceQueryID": "d0821534-5b8d-4c49-b188-e72ba00f9a12",
              "MappingFieldName": "AppId",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "AspNetUserRoles",
      "Resources": null,
      "IsSystem": true,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "b054b76f-44b3-415c-83e1-a89dbe5ede10",
      "AppObjectConfiguration": null,
      "AllowVersioning": false,
      "IsSupportBluePrint": false,
      "IsLocationTracking": false,
      "AllowSoftDelete": false,
      "IsReplicationNeeded": true,
      "IsCacheEnable": false,
      "CacheTtl": 0,
      "ConnectionId": "8ccb12d3-3a42-4871-8494-1b541a796ca2",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "905a3188-6e49-43ec-9c91-9a9077da6594",
        "UpdatedBy": null,
        "CreatedOn": "2024-06-25T12:17:43.617",
        "UpdatedOn": "2025-06-04T10:50:15",
        "IsSystemRecord": true,
        "AppId": null
      }
    },
    {
      "ID": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
      "ObjectName": "AspNetUsers",
      "DisplayName": "AspNetUsers",
      "Description": "AspNetUsers",
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": false,
      "DeploymentStatus": 2,
      "Fields": [
        {
          "ID": "b973c3a4-4fb5-4d4b-88a7-0fee85d89c8c",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "PersonId",
          "DisplayName": "PersonId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "PersonId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_Person",
            "LookupField": "Id",
            "DisplayField": "FirstName",
            "selectQuery": null
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "b3f25264-abac-488e-80fc-116b9e164d8c",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "LastLoginTime",
          "DisplayName": "LastLoginTime",
          "FieldType": {
            "DataType": 6,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "LastLoginTime",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "b6733aa5-643c-43cd-93b3-1ca21de05a1f",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "EmailConfirmed",
          "DisplayName": "EmailConfirmed",
          "FieldType": {
            "DataType": 3,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "EmailConfirmed",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "edeac2a4-c4da-43c0-a635-202590636dbf",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "LockoutEnabled",
          "DisplayName": "LockoutEnabled",
          "FieldType": {
            "DataType": 3,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "LockoutEnabled",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "e4cf6466-a81b-4ccc-8249-30a9f6e1770a",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "PhoneNumberConfirmed",
          "DisplayName": "PhoneNumberConfirmed",
          "FieldType": {
            "DataType": 3,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "PhoneNumberConfirmed",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "853d0514-d9a4-45fe-8a3e-478d2c2b7273",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "NormalizedUserName",
          "DisplayName": "NormalizedUserName",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "NormalizedUserName",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "1257d3ae-16c2-46e2-88e3-48bf9817d020",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "Email",
          "DisplayName": "Email",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Email",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "f57086d2-67dd-4058-ac9c-4b186fc5fba0",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "FirstName",
          "DisplayName": "FirstName",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "FirstName",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "e964f910-c941-4d0e-83a0-69fb6e78f2fd",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "UserName",
          "DisplayName": "UserName",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "UserName",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "0ee91d62-2e17-4ee8-8e7e-7e9c75b57bab",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "LocaleSettings",
          "DisplayName": "LocaleSettings",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "LocaleSettings",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "699a0acf-3a16-42ea-ad32-7ef9862740ff",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "SecurityStamp",
          "DisplayName": "SecurityStamp",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "SecurityStamp",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "f90a45bb-f28f-4afb-be77-808d8e76a09e",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "TwoFactorEnabled",
          "DisplayName": "TwoFactorEnabled",
          "FieldType": {
            "DataType": 3,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "TwoFactorEnabled",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "efebf3d2-e068-41f6-8317-85c9740eeeb5",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "LastName",
          "DisplayName": "LastName",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "LastName",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "94958616-28f3-4eeb-9785-867838c04067",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "AccessFailedCount",
          "DisplayName": "AccessFailedCount",
          "FieldType": {
            "DataType": 2,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "AccessFailedCount",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "ab42532e-0c29-46dd-a5c5-a739ac17e2ac",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "PhoneNumber",
          "DisplayName": "PhoneNumber",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "PhoneNumber",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "1658c918-54d8-4b07-9fdf-b43df9fc1a3b",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "LockoutEnd",
          "DisplayName": "LockoutEnd",
          "FieldType": {
            "DataType": 6,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "LockoutEnd",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "d951b361-be90-4186-812e-ba03e5245a20",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "Permission",
          "DisplayName": "Permission",
          "FieldType": {
            "DataType": 2,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Permission",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "be45416a-5b52-401a-9e21-ba5be08a760e",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "IsEnabled",
          "DisplayName": "IsEnabled",
          "FieldType": {
            "DataType": 3,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "IsEnabled",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "c2a57da3-1163-4e2a-94a7-d0d4c59ede48",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "NormalizedEmail",
          "DisplayName": "NormalizedEmail",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "NormalizedEmail",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "5d31e7df-5028-47cb-a4da-e0df70ac93f9",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "E62A3E7B-92C5-439C-A95B-6CA6D133B37F",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "a180a3c4-3730-47d3-adaa-e3775891a6de",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "ConcurrencyStamp",
          "DisplayName": "ConcurrencyStamp",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "ConcurrencyStamp",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "db76ce55-78b3-40c8-ba88-e5885ba0d51c",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "Id",
          "DisplayName": "Id",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Id",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "c6eb507a-eb62-44ad-bec3-ecd25a6d1851",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "FieldName": "PasswordHash",
          "DisplayName": "PasswordHash",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "PasswordHash",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": [
        {
          "childDetails": {
            "LookupObject": "AspNetUserRoles",
            "LookupField": "UserId",
            "DisplayField": "",
            "selectQuery": null
          },
          "LocalId": "Id"
        },
        {
          "childDetails": {
            "LookupObject": "TABMD_User_Environments",
            "LookupField": "UserId",
            "DisplayField": "",
            "selectQuery": null
          },
          "LocalId": "Id"
        }
      ],
      "DataSourceQueries": [
        {
          "ID": "fd153cac-8717-4c34-b6fd-303c750dd05e",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "QueryName": "DEV_AspNetUsers",
          "DisplayName": "DEV_AspNetUsers",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "2a01e123-4ea4-4a02-9a3d-08d10cf32a18",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "edeac2a4-c4da-43c0-a635-202590636dbf"
            },
            {
              "ID": "8c4abcb5-2b92-4be8-be66-1eff94dec011",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1257d3ae-16c2-46e2-88e3-48bf9817d020"
            },
            {
              "ID": "3538d15c-7c98-494a-90b0-2630f3e2978f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "f90a45bb-f28f-4afb-be77-808d8e76a09e"
            },
            {
              "ID": "c77e681f-9080-48fa-b91f-4cd07a9a9904",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d951b361-be90-4186-812e-ba03e5245a20"
            },
            {
              "ID": "49fef965-8cef-4100-ab9e-52b1fd15c118",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "f57086d2-67dd-4058-ac9c-4b186fc5fba0"
            },
            {
              "ID": "c2531936-234f-4f49-9044-5bd0e0fbf51d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b6733aa5-643c-43cd-93b3-1ca21de05a1f"
            },
            {
              "ID": "cc43253c-08b1-4f6c-a826-60f4360c0fd0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "5d31e7df-5028-47cb-a4da-e0df70ac93f9"
            },
            {
              "ID": "c85fe898-cddc-4cf5-b03a-6e6d688ede6a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b973c3a4-4fb5-4d4b-88a7-0fee85d89c8c"
            },
            {
              "ID": "0eb906c5-9c96-4099-9d79-6fdcbac0fe58",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0ee91d62-2e17-4ee8-8e7e-7e9c75b57bab"
            },
            {
              "ID": "765d0f2b-6437-47d9-a7ca-775372106b8d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e964f910-c941-4d0e-83a0-69fb6e78f2fd"
            },
            {
              "ID": "7073d25e-72f5-4c2d-b185-7fdafc72dab4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e4cf6466-a81b-4ccc-8249-30a9f6e1770a"
            },
            {
              "ID": "62fe57ed-ebec-425d-a9d5-86b0e5e75ec1",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "db76ce55-78b3-40c8-ba88-e5885ba0d51c"
            },
            {
              "ID": "9ee969c4-f4d2-4516-a9e0-8b141f2994eb",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c6eb507a-eb62-44ad-bec3-ecd25a6d1851"
            },
            {
              "ID": "0816ae6b-a204-403a-a0fa-a1a6765acac7",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "94958616-28f3-4eeb-9785-867838c04067"
            },
            {
              "ID": "778ba4dd-86df-4e0f-8b9d-bc8722fba604",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b3f25264-abac-488e-80fc-116b9e164d8c"
            },
            {
              "ID": "cbe2c818-461a-48d8-9123-c247bb9b19bf",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "a180a3c4-3730-47d3-adaa-e3775891a6de"
            },
            {
              "ID": "8eb62fa5-5d8c-4258-a0ac-c8ef51b15bc1",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c2a57da3-1163-4e2a-94a7-d0d4c59ede48"
            },
            {
              "ID": "b0480521-e6ec-4816-892f-c978da13b051",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ab42532e-0c29-46dd-a5c5-a739ac17e2ac"
            },
            {
              "ID": "abff0bca-f9f7-4f8b-8e1c-ca323fdceee0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1658c918-54d8-4b07-9fdf-b43df9fc1a3b"
            },
            {
              "ID": "f439f895-9c28-4f80-b534-da117ae69f32",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "853d0514-d9a4-45fe-8a3e-478d2c2b7273"
            },
            {
              "ID": "121eb981-a915-4b73-ac3b-e11a63d8e196",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "699a0acf-3a16-42ea-ad32-7ef9862740ff"
            },
            {
              "ID": "affff37b-bfb7-4776-a2dd-e9243352c0da",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "be45416a-5b52-401a-9e21-ba5be08a760e"
            },
            {
              "ID": "1a47a09a-5564-4611-87c4-ebed4624716a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "efebf3d2-e068-41f6-8317-85c9740eeeb5"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "10b9c437-e8a1-4042-baab-463bc4e978ca",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "QueryName": "FK_AspNetUsers_TABD_Person",
          "DisplayName": "FK_AspNetUsers_TABD_Person",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "b3caa631-fa48-4c1c-9e46-2a6862147200",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "f57086d2-67dd-4058-ac9c-4b186fc5fba0"
            },
            {
              "ID": "925e2ada-ea9c-417c-9a3d-2bc66f4d9fff",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b6733aa5-643c-43cd-93b3-1ca21de05a1f"
            },
            {
              "ID": "a6e42aa5-47a2-40ba-92e0-2cd292e6ff57",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c6eb507a-eb62-44ad-bec3-ecd25a6d1851"
            },
            {
              "ID": "cf4673e8-32db-4459-9cf7-3187667d295d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c2a57da3-1163-4e2a-94a7-d0d4c59ede48"
            },
            {
              "ID": "8700945d-584c-42c7-afc4-50958dcc18af",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b3f25264-abac-488e-80fc-116b9e164d8c"
            },
            {
              "ID": "2472c2ed-8166-4b84-b33c-584434112aef",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1658c918-54d8-4b07-9fdf-b43df9fc1a3b"
            },
            {
              "ID": "5608365d-94a0-43f4-865d-593f8ff1aea6",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "efebf3d2-e068-41f6-8317-85c9740eeeb5"
            },
            {
              "ID": "1946bf4f-71ac-4f97-b8e1-5d6387d4a3b2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d951b361-be90-4186-812e-ba03e5245a20"
            },
            {
              "ID": "4a714f24-d7e1-45c1-9127-662f67acbe53",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "edeac2a4-c4da-43c0-a635-202590636dbf"
            },
            {
              "ID": "c8c1db0d-3df7-4fa2-b0e8-6c3bdf00bb50",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ab42532e-0c29-46dd-a5c5-a739ac17e2ac"
            },
            {
              "ID": "71ab925d-f4ce-48da-84fa-6cf2a1a88079",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0ee91d62-2e17-4ee8-8e7e-7e9c75b57bab"
            },
            {
              "ID": "d18b4ae7-bded-4dd0-948e-7ed515796535",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1257d3ae-16c2-46e2-88e3-48bf9817d020"
            },
            {
              "ID": "539dea1b-4e41-4292-a0d5-8b80d9433626",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e964f910-c941-4d0e-83a0-69fb6e78f2fd"
            },
            {
              "ID": "af03ed13-e964-4f31-a3fe-8d25d2f06331",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "5d31e7df-5028-47cb-a4da-e0df70ac93f9"
            },
            {
              "ID": "bdcae371-2e0f-4eb8-b088-904cedefad58",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "853d0514-d9a4-45fe-8a3e-478d2c2b7273"
            },
            {
              "ID": "965f1b99-7f89-4973-8a72-b8ff42308ccb",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "f90a45bb-f28f-4afb-be77-808d8e76a09e"
            },
            {
              "ID": "2f29c556-0dba-4f5a-9a23-bb1ea0f9101e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "db76ce55-78b3-40c8-ba88-e5885ba0d51c"
            },
            {
              "ID": "f7102476-f68a-4b01-879e-c7e87cd9fadb",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "a180a3c4-3730-47d3-adaa-e3775891a6de"
            },
            {
              "ID": "ae196cbc-3fb5-48a1-b711-dd441451b798",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e4cf6466-a81b-4ccc-8249-30a9f6e1770a"
            },
            {
              "ID": "8b4d7feb-82ce-4c0b-b987-dd86dca3de19",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "699a0acf-3a16-42ea-ad32-7ef9862740ff"
            },
            {
              "ID": "2cb4a543-0e17-4999-b4f9-e3f2a6c4b945",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "be45416a-5b52-401a-9e21-ba5be08a760e"
            },
            {
              "ID": "02206aa1-e680-4e38-82ee-f6905bd20363",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b973c3a4-4fb5-4d4b-88a7-0fee85d89c8c"
            },
            {
              "ID": "0c42b566-8c96-49e9-87cc-ffc3e596fbb0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "94958616-28f3-4eeb-9785-867838c04067"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "37ec37c1-8a84-4f4b-9cd2-720da7703277",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "b973c3a4-4fb5-4d4b-88a7-0fee85d89c8c"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "d833bf70-f378-416e-9fd9-f9681e16add7",
              "ParameterName": "Id",
              "DataSourceQueryID": "10b9c437-e8a1-4042-baab-463bc4e978ca",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "d5a3779a-d39a-4d6c-8d6b-660673b1b036",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "QueryName": "Default_AspNetUsers",
          "DisplayName": "Default_AspNetUsers",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "281f7f7d-f0da-49c8-832b-0fee994c82a7",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "edeac2a4-c4da-43c0-a635-202590636dbf"
            },
            {
              "ID": "0eb20b4f-2182-40d7-a1cf-10e3ec7ae722",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e964f910-c941-4d0e-83a0-69fb6e78f2fd"
            },
            {
              "ID": "204563ca-7fc2-401f-b77c-192c458bd746",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1658c918-54d8-4b07-9fdf-b43df9fc1a3b"
            },
            {
              "ID": "216702b5-14eb-4511-bd64-1c899078d4de",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0ee91d62-2e17-4ee8-8e7e-7e9c75b57bab"
            },
            {
              "ID": "9e2a29bd-ac0f-4149-804c-346c90a6b5af",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c2a57da3-1163-4e2a-94a7-d0d4c59ede48"
            },
            {
              "ID": "1cdbea62-b9aa-46f3-b2e6-35eb36f39a3b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "be45416a-5b52-401a-9e21-ba5be08a760e"
            },
            {
              "ID": "d603f24d-effb-407c-a920-3d600caf626f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "5d31e7df-5028-47cb-a4da-e0df70ac93f9"
            },
            {
              "ID": "16f66599-a40b-403c-9e9f-4c15cbfa8df8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1257d3ae-16c2-46e2-88e3-48bf9817d020"
            },
            {
              "ID": "e8864ec0-7bde-4144-ac95-7224fdd8ccf7",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "699a0acf-3a16-42ea-ad32-7ef9862740ff"
            },
            {
              "ID": "16191eb4-55da-43f7-8371-93554fee8b7d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "94958616-28f3-4eeb-9785-867838c04067"
            },
            {
              "ID": "707da5e8-d68e-4622-9bb6-95f01e42f34d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b973c3a4-4fb5-4d4b-88a7-0fee85d89c8c"
            },
            {
              "ID": "2d6d8325-0fc3-413f-ad40-9d94ad72fe22",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e4cf6466-a81b-4ccc-8249-30a9f6e1770a"
            },
            {
              "ID": "3824b773-ab06-4a12-84fe-a1d8080fdae8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "853d0514-d9a4-45fe-8a3e-478d2c2b7273"
            },
            {
              "ID": "03cc0038-6545-409f-ad35-a5726dbfab2a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b3f25264-abac-488e-80fc-116b9e164d8c"
            },
            {
              "ID": "d2a12a79-bec7-47fa-b97f-a8f408f3be72",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "db76ce55-78b3-40c8-ba88-e5885ba0d51c"
            },
            {
              "ID": "3e953918-5c5f-439e-8b6d-b751cf2ac827",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ab42532e-0c29-46dd-a5c5-a739ac17e2ac"
            },
            {
              "ID": "fb762d26-006e-4b26-94ef-c22edc260bb3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c6eb507a-eb62-44ad-bec3-ecd25a6d1851"
            },
            {
              "ID": "2a9f4d5a-f7df-4e83-98ab-c458a80fb4a9",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "f57086d2-67dd-4058-ac9c-4b186fc5fba0"
            },
            {
              "ID": "38a5372e-a877-49a4-bc4e-c5885c5f583c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "efebf3d2-e068-41f6-8317-85c9740eeeb5"
            },
            {
              "ID": "56ea3022-eb3b-4c55-bd1c-e83171aa39ed",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b6733aa5-643c-43cd-93b3-1ca21de05a1f"
            },
            {
              "ID": "16261ca3-3966-4026-a7c2-ec3462d46ee2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "a180a3c4-3730-47d3-adaa-e3775891a6de"
            },
            {
              "ID": "e1073ce1-bdc2-4870-9c3e-f2fb81f3fa63",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "f90a45bb-f28f-4afb-be77-808d8e76a09e"
            },
            {
              "ID": "96c5cbfb-b13a-42db-b29a-f3be5da9d02c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d951b361-be90-4186-812e-ba03e5245a20"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "21d6c096-1bce-4a92-9be4-79b35f563930",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "QueryName": "Detail_AspNetUsers",
          "DisplayName": "Detail_AspNetUsers",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "f812b1ed-4d95-4a3a-86a6-019866f5b554",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "db76ce55-78b3-40c8-ba88-e5885ba0d51c"
            },
            {
              "ID": "e4f277a7-94d3-47a8-a162-02a9063ea24c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "a180a3c4-3730-47d3-adaa-e3775891a6de"
            },
            {
              "ID": "6a99ba6f-e492-4de4-abdd-15e2431692bc",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c6eb507a-eb62-44ad-bec3-ecd25a6d1851"
            },
            {
              "ID": "1557c7c9-fbe3-4514-9867-23591d677af3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1658c918-54d8-4b07-9fdf-b43df9fc1a3b"
            },
            {
              "ID": "86ed14e5-56e0-4b69-80a8-277115bd3b92",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b973c3a4-4fb5-4d4b-88a7-0fee85d89c8c"
            },
            {
              "ID": "e4e91637-d64d-4e9c-b782-27f2c91c76be",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e4cf6466-a81b-4ccc-8249-30a9f6e1770a"
            },
            {
              "ID": "5fa60719-5ab2-4f67-b35a-36b84f308a18",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0ee91d62-2e17-4ee8-8e7e-7e9c75b57bab"
            },
            {
              "ID": "9ff510c4-17b8-42f4-8adf-40d2ed88b805",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1257d3ae-16c2-46e2-88e3-48bf9817d020"
            },
            {
              "ID": "2d0ec3e9-d340-474d-8aa1-4499619b0951",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "94958616-28f3-4eeb-9785-867838c04067"
            },
            {
              "ID": "ffdb9d1c-e868-4f82-815f-6d86e3574a4b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "be45416a-5b52-401a-9e21-ba5be08a760e"
            },
            {
              "ID": "a6e8a07c-64d2-44a0-9d64-768f4af1e0f6",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b6733aa5-643c-43cd-93b3-1ca21de05a1f"
            },
            {
              "ID": "eaa08850-4845-4549-9109-78cd562fb8d3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "f90a45bb-f28f-4afb-be77-808d8e76a09e"
            },
            {
              "ID": "b6e41de7-5c07-4630-82f8-793d92e13386",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d951b361-be90-4186-812e-ba03e5245a20"
            },
            {
              "ID": "145ac884-b2e7-402d-a32a-7ee104ea457e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "f57086d2-67dd-4058-ac9c-4b186fc5fba0"
            },
            {
              "ID": "fdfee4df-5ab3-45de-87db-80297952bc39",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "5d31e7df-5028-47cb-a4da-e0df70ac93f9"
            },
            {
              "ID": "60cab40d-3f22-4437-a4bd-961ff4a8b089",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "edeac2a4-c4da-43c0-a635-202590636dbf"
            },
            {
              "ID": "46a46807-60e9-4a0b-a796-9bb27a2e235a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ab42532e-0c29-46dd-a5c5-a739ac17e2ac"
            },
            {
              "ID": "d852f179-2b84-49eb-98e8-a9974df2cb85",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "853d0514-d9a4-45fe-8a3e-478d2c2b7273"
            },
            {
              "ID": "8b3ff5e4-a798-411a-bc60-c706b5f69240",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e964f910-c941-4d0e-83a0-69fb6e78f2fd"
            },
            {
              "ID": "a7391329-9d87-41fd-bda9-d49e0590e1e2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "699a0acf-3a16-42ea-ad32-7ef9862740ff"
            },
            {
              "ID": "566a84bb-dfb3-4397-9ac3-ecfc4d70f3ad",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "efebf3d2-e068-41f6-8317-85c9740eeeb5"
            },
            {
              "ID": "f2a3abff-5933-45f6-824c-f07c32cc1137",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c2a57da3-1163-4e2a-94a7-d0d4c59ede48"
            },
            {
              "ID": "eacaf1b4-63b8-46fe-aa53-fcd21bbee674",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b3f25264-abac-488e-80fc-116b9e164d8c"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "36d725bd-17b4-4194-b257-e18d6bed4854",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "db76ce55-78b3-40c8-ba88-e5885ba0d51c"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "1f4d656b-51bd-46e5-806b-7b1ef932f4df",
              "ParameterName": "Id",
              "DataSourceQueryID": "21d6c096-1bce-4a92-9be4-79b35f563930",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "66db734d-5d60-4b5e-9ec9-7dc6cd95930d",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "QueryName": "User_Profile_AspNetUsers",
          "DisplayName": "User_Profile_AspNetUsers",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "8fb36cba-f49b-4f0e-85d4-07ea1de5a596",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "db76ce55-78b3-40c8-ba88-e5885ba0d51c"
            },
            {
              "ID": "c64177b0-31cd-47c3-8b94-09ee14e22d54",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e964f910-c941-4d0e-83a0-69fb6e78f2fd"
            },
            {
              "ID": "dce8ff94-a597-4176-8ee5-0c048038de9b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "be45416a-5b52-401a-9e21-ba5be08a760e"
            },
            {
              "ID": "587849bc-077e-494d-8bbe-0e07db6949ed",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.Gender",
              "AppFieldID": "65456599-7a5a-4abb-9b69-858c3fbe8480"
            },
            {
              "ID": "c562b46d-c4bc-4266-a7f9-26ae39bbf0ed",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e4cf6466-a81b-4ccc-8249-30a9f6e1770a"
            },
            {
              "ID": "f9ae4721-5b00-44dc-bafd-558b52315eed",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.DOB",
              "AppFieldID": "885ebda6-e472-4b5f-9552-6ed840086ca6"
            },
            {
              "ID": "c5c49db0-2d28-453a-b587-56a2e1abdf86",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.MiddleName",
              "AppFieldID": "d0a5791e-029e-4b1b-bd97-c01f1dfaf48e"
            },
            {
              "ID": "c9eb7065-beec-4df6-a63f-58e2b367885f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.LastName",
              "AppFieldID": "22342631-d553-4afc-bdbd-ad3a2949faf1"
            },
            {
              "ID": "20512801-f87f-4cde-ae69-7fa7e63e2c86",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.EducationQualification",
              "AppFieldID": "6e471116-5033-455e-acc3-3c864282841d"
            },
            {
              "ID": "f7ed5316-523f-4efd-b0c1-807420d4ca92",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "f57086d2-67dd-4058-ac9c-4b186fc5fba0"
            },
            {
              "ID": "110008cb-a2b5-4c84-8e9c-a708a2b22ac6",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b6733aa5-643c-43cd-93b3-1ca21de05a1f"
            },
            {
              "ID": "4579328a-16fc-48b0-8a72-b0f590bbf3e9",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.FirstName",
              "AppFieldID": "a7399032-1670-4a49-98dc-d340d538c2f6"
            },
            {
              "ID": "bc194dd6-0e2b-4a7c-b06b-ba5008ea37d2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.Id",
              "AppFieldID": "80851bd1-10e3-4243-bf74-66fe3ef85d2b"
            },
            {
              "ID": "618877a8-3287-4e92-b85a-c84c6baf2e34",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b3f25264-abac-488e-80fc-116b9e164d8c"
            },
            {
              "ID": "5e2108f6-f789-419f-9482-d0c8a12164ec",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ab42532e-0c29-46dd-a5c5-a739ac17e2ac"
            },
            {
              "ID": "a69c7271-7af9-4037-999b-d664831a5adb",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "efebf3d2-e068-41f6-8317-85c9740eeeb5"
            },
            {
              "ID": "2be7df3f-aedc-4625-95c3-de5f89991cd9",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1257d3ae-16c2-46e2-88e3-48bf9817d020"
            },
            {
              "ID": "745b5e61-2b99-48cf-9570-e3a4e0001746",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.Title",
              "AppFieldID": "ad1d170b-fedf-4c41-8928-8c83c542cf92"
            },
            {
              "ID": "889da994-db5b-499a-bd81-e4197bc578f9",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.AdditionalQualification",
              "AppFieldID": "6155ae7e-382c-4ca2-8bdd-a8eb9c87176f"
            },
            {
              "ID": "672bd84e-56b1-4dba-8369-f76bee9a966d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.ProfileImageId",
              "AppFieldID": "9c9d8dfc-5a9e-47c7-8ba3-473adcbfecc6"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "7c07bff6-d56e-05f7-9958-ebb4956b393d",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "db76ce55-78b3-40c8-ba88-e5885ba0d51c"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "c116e5a0-2082-4c25-85b3-c04988f6ca9a",
              "ParameterName": "Id",
              "DataSourceQueryID": "66db734d-5d60-4b5e-9ec9-7dc6cd95930d",
              "MappingFieldName": "Id",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "e5b8cc2c-4c6d-4e00-80f5-8bd9568da499",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "QueryName": "List_AspNetUsers_PMS",
          "DisplayName": "List_AspNetUsers_PMS",
          "FilterLogic": null,
          "Fields": [],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "80588cb4-27c5-4a61-9de3-b0b3b346ee76",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "QueryName": "List_Users",
          "DisplayName": "List_Users",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "53148600-7ec5-45fa-b9b4-0292949035f4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1257d3ae-16c2-46e2-88e3-48bf9817d020"
            },
            {
              "ID": "b1cf06d6-bb8e-4950-a39e-245dcef4d31b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "db76ce55-78b3-40c8-ba88-e5885ba0d51c"
            },
            {
              "ID": "b336005c-1c19-40b6-867d-3a778cdcfde5",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e4cf6466-a81b-4ccc-8249-30a9f6e1770a"
            },
            {
              "ID": "01a92377-e800-4d1c-b4f3-3c86d425be7d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "be45416a-5b52-401a-9e21-ba5be08a760e"
            },
            {
              "ID": "64c3ee76-3f4c-4e6d-a37e-45cbf3b5accf",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b6733aa5-643c-43cd-93b3-1ca21de05a1f"
            },
            {
              "ID": "8a99484b-b539-41a5-bea7-4e7ad7c78c43",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "f57086d2-67dd-4058-ac9c-4b186fc5fba0"
            },
            {
              "ID": "b0f9f313-b652-431c-b9b1-c63e23ce6cc5",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "efebf3d2-e068-41f6-8317-85c9740eeeb5"
            },
            {
              "ID": "aac0aad1-c30e-4902-bb71-fb4dad1882e7",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e964f910-c941-4d0e-83a0-69fb6e78f2fd"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "fbb82555-19cb-4f05-beb3-beae47989f51",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "QueryName": "List_AspNetUsers",
          "DisplayName": "List_AspNetUsers",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "c62034a9-e7d2-44d2-b80d-0459aa5c6e7e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "efebf3d2-e068-41f6-8317-85c9740eeeb5"
            },
            {
              "ID": "30986e64-6a54-4b16-a669-545a00e403c9",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e964f910-c941-4d0e-83a0-69fb6e78f2fd"
            },
            {
              "ID": "e62e8228-b68e-45cf-ac11-8439dd793c4b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "853d0514-d9a4-45fe-8a3e-478d2c2b7273"
            },
            {
              "ID": "ab57fffc-7444-4620-a7e8-9518f875d2ae",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "f57086d2-67dd-4058-ac9c-4b186fc5fba0"
            },
            {
              "ID": "35c35824-9dd7-42ca-bb6d-f68158f8d619",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "db76ce55-78b3-40c8-ba88-e5885ba0d51c"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "1648c259-52ff-45b6-b07c-cddab627f004",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "QueryName": "Subscriber_AspNetUsers",
          "DisplayName": "Subscriber_AspNetUsers",
          "FilterLogic": null,
          "Fields": [],
          "Filters": {
            "Filters": [
              {
                "ID": "534d8069-d776-4859-8db9-42d473429782",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "3f1ef70d-e2b6-4cf3-85ed-c23dadf9c90d"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "ab1119a0-50cc-4d1c-9d94-d65d576f7581",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "QueryName": "List_AspNetUsers_Filter",
          "DisplayName": "List_AspNetUsers_Filter",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "6a329ef3-2495-40b4-8edb-2b0c0634d9b3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.LastName",
              "AppFieldID": "22342631-d553-4afc-bdbd-ad3a2949faf1"
            },
            {
              "ID": "aa63910d-8a85-421e-bff5-d083a4375405",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.FirstName",
              "AppFieldID": "a7399032-1670-4a49-98dc-d340d538c2f6"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "fb79dd69-4add-43c6-8951-dbd67b89882b",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "QueryName": "Get_UserDetails_WithAssignedRoles",
          "DisplayName": "Get_UserDetails_WithAssignedRoles",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "cdf3b398-50ac-450f-b7c5-1785d0f70a31",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b6733aa5-643c-43cd-93b3-1ca21de05a1f"
            },
            {
              "ID": "99437a85-aec6-4a6f-a810-2b864edba432",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 6,
              "FieldDetails": "#AspNetUserRoles:Get_TenantWise_UserRoles",
              "AppFieldID": "49165765-a408-4bb8-9b2a-b4143a1102c9"
            },
            {
              "ID": "0703497e-41d1-4a26-aa6c-4100b0088aab",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "be45416a-5b52-401a-9e21-ba5be08a760e"
            },
            {
              "ID": "fca8bc97-190a-433e-ba7d-4f5c75e8acb8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e4cf6466-a81b-4ccc-8249-30a9f6e1770a"
            },
            {
              "ID": "82186a0c-ae19-48cb-ad3e-611ca2edd461",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.FirstName",
              "AppFieldID": "a7399032-1670-4a49-98dc-d340d538c2f6"
            },
            {
              "ID": "9832b7cd-9501-42fc-99fc-691445bc9822",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 6,
              "FieldDetails": "#TABMD_User_Environments:Get_Appwise_UserEnvironments_TABMD_User_Environments",
              "AppFieldID": "59a80d40-bedc-4151-898a-4e8367b118d1"
            },
            {
              "ID": "1d25aafd-0424-4676-af36-6d046a52933f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.MiddleName",
              "AppFieldID": "d0a5791e-029e-4b1b-bd97-c01f1dfaf48e"
            },
            {
              "ID": "b8ff1f91-eda4-4dd2-895e-9770a3f91d81",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1257d3ae-16c2-46e2-88e3-48bf9817d020"
            },
            {
              "ID": "bbc5e020-9412-4a27-a492-a471f1629a41",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.Id",
              "AppFieldID": "80851bd1-10e3-4243-bf74-66fe3ef85d2b"
            },
            {
              "ID": "e62f5d78-0640-4043-abd9-a8fe56ddbe21",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ab42532e-0c29-46dd-a5c5-a739ac17e2ac"
            },
            {
              "ID": "fcef869a-b437-41f9-856a-d69874482506",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "db76ce55-78b3-40c8-ba88-e5885ba0d51c"
            },
            {
              "ID": "316d075b-0601-4851-8f79-e33e17780858",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.LastName",
              "AppFieldID": "22342631-d553-4afc-bdbd-ad3a2949faf1"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "db76ce55-78b3-40c8-ba88-e5885ba0d51c"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "834760a6-99b1-47ce-88fe-5e9219b66b58",
              "ParameterName": "Id",
              "DataSourceQueryID": "fb79dd69-4add-43c6-8951-dbd67b89882b",
              "MappingFieldName": "Id",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "bb23f235-7f8a-4f16-a1df-e5bc38cf8166",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "QueryName": "Email_AspNetUser",
          "DisplayName": "Email_AspNetUser",
          "FilterLogic": "1",
          "Fields": [],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 2,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Email",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "1257d3ae-16c2-46e2-88e3-48bf9817d020"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "722fce26-7071-44e7-bd85-7f29ac35554c",
              "ParameterName": "Email",
              "DataSourceQueryID": "bb23f235-7f8a-4f16-a1df-e5bc38cf8166",
              "MappingFieldName": "Email",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "a286f12c-8e70-49cc-9c73-ef2dd237ffae",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "QueryName": "Tenant_User_AspNetUsers",
          "DisplayName": "Tenant_User_AspNetUsers",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "2f401a31-a4f5-4513-a8ee-1ab57147cc2b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.Id",
              "AppFieldID": "80851bd1-10e3-4243-bf74-66fe3ef85d2b"
            },
            {
              "ID": "14707e0f-200a-4375-bd90-56ec70562b16",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.FirstName",
              "AppFieldID": "a7399032-1670-4a49-98dc-d340d538c2f6"
            },
            {
              "ID": "93da30c0-b64f-4bb8-a583-70d35ae09dbc",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e4cf6466-a81b-4ccc-8249-30a9f6e1770a"
            },
            {
              "ID": "cfd57a4f-083c-4f3c-97d8-96ec5dd2c8b6",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.LastName",
              "AppFieldID": "22342631-d553-4afc-bdbd-ad3a2949faf1"
            },
            {
              "ID": "5b448146-c1f8-46a9-a268-9b9110a325fb",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "PersonId.MiddleName",
              "AppFieldID": "d0a5791e-029e-4b1b-bd97-c01f1dfaf48e"
            },
            {
              "ID": "56c3ad7f-b080-40f4-b8e7-a81f7ff959f0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "db76ce55-78b3-40c8-ba88-e5885ba0d51c"
            },
            {
              "ID": "c0da1bef-57cb-4a58-9eea-b66e09df699c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "be45416a-5b52-401a-9e21-ba5be08a760e"
            },
            {
              "ID": "9259bfdc-ad61-42d0-9358-f0d38894fa1b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b6733aa5-643c-43cd-93b3-1ca21de05a1f"
            },
            {
              "ID": "cb81cdbb-5bd0-4981-a234-f427fa7dd31b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ab42532e-0c29-46dd-a5c5-a739ac17e2ac"
            },
            {
              "ID": "bd944715-43c2-4418-883e-f50010c230ed",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1257d3ae-16c2-46e2-88e3-48bf9817d020"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "db76ce55-78b3-40c8-ba88-e5885ba0d51c"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "4b4a2467-dd1d-460b-a3ce-22e4dceddd51",
              "ParameterName": "Id",
              "DataSourceQueryID": "a286f12c-8e70-49cc-9c73-ef2dd237ffae",
              "MappingFieldName": "Id",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "50b018de-5d6b-4672-95b7-f50765b36b95",
          "ObjectID": null,
          "ObjectID_Tosave": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
          "QueryName": "Get_Appwise_RoleDetails_AspNetUsers",
          "DisplayName": "Get_Appwise_RoleDetails_AspNetUsers",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "d3cddb11-0b84-4019-b7ad-8f7f25222ac8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "db76ce55-78b3-40c8-ba88-e5885ba0d51c"
            },
            {
              "ID": "c64aa462-db5a-4ad6-bac5-f4508d8c9e11",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 6,
              "FieldDetails": "#AspNetUserRoles:Default_AspNetUserRoles",
              "AppFieldID": "7aecf401-0622-4e90-a432-48abd9734f09"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "db76ce55-78b3-40c8-ba88-e5885ba0d51c"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "9b2f7ab2-0f9f-46a2-90c6-32a99b875a9b",
              "ParameterName": "Id",
              "DataSourceQueryID": "50b018de-5d6b-4672-95b7-f50765b36b95",
              "MappingFieldName": "Id",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "AspNetUsers",
      "Resources": null,
      "IsSystem": true,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "e62a3e7b-92c5-439c-a95b-6ca6d133b37f",
      "AppObjectConfiguration": null,
      "AllowVersioning": false,
      "IsSupportBluePrint": false,
      "IsLocationTracking": false,
      "AllowSoftDelete": false,
      "IsReplicationNeeded": true,
      "IsCacheEnable": false,
      "CacheTtl": 0,
      "ConnectionId": "8ccb12d3-3a42-4871-8494-1b541a796ca2",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "905a3188-6e49-43ec-9c91-9a9077da6594",
        "UpdatedBy": "d052a189-a33f-4acd-8012-f66f9cc07cd3",
        "CreatedOn": "2024-06-25T12:17:43.617",
        "UpdatedOn": "2025-06-04T10:48:53",
        "IsSystemRecord": true,
        "AppId": null
      }
    },
    {
      "ID": "5b02b203-5c03-4688-ba89-44b8acc1f6dd",
      "ObjectName": "AspNetUserTokens",
      "DisplayName": "AspNetUserTokens",
      "Description": "AspNetUserTokens",
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": false,
      "DeploymentStatus": 2,
      "Fields": [
        {
          "ID": "7883f6d2-8d5d-40d3-8989-1f356e291c23",
          "ObjectID": null,
          "ObjectID_Tosave": "5b02b203-5c03-4688-ba89-44b8acc1f6dd",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "5B02B203-5C03-4688-BA89-44B8ACC1F6DD",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "673def08-877b-4e4d-a742-3a6cc66c961e",
          "ObjectID": null,
          "ObjectID_Tosave": "5b02b203-5c03-4688-ba89-44b8acc1f6dd",
          "FieldName": "Name",
          "DisplayName": "Name",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Name",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "24b326f2-dd87-4f4a-b130-9f1586d0b8d3",
          "ObjectID": null,
          "ObjectID_Tosave": "5b02b203-5c03-4688-ba89-44b8acc1f6dd",
          "FieldName": "UserId",
          "DisplayName": "UserId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "UserId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "c0332d01-5e01-446c-b800-d7bc980832dd",
          "ObjectID": null,
          "ObjectID_Tosave": "5b02b203-5c03-4688-ba89-44b8acc1f6dd",
          "FieldName": "Value",
          "DisplayName": "Value",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Value",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "b8e590b3-8e81-4a88-86af-edcab8e9c58f",
          "ObjectID": null,
          "ObjectID_Tosave": "5b02b203-5c03-4688-ba89-44b8acc1f6dd",
          "FieldName": "LoginProvider",
          "DisplayName": "LoginProvider",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "LoginProvider",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": null,
      "DataSourceQueries": [
        {
          "ID": "c6af88ed-9d6e-4884-ae9b-2d36cf3e7c3e",
          "ObjectID": null,
          "ObjectID_Tosave": "5b02b203-5c03-4688-ba89-44b8acc1f6dd",
          "QueryName": "List_AspNetUserTokens",
          "DisplayName": "List_AspNetUserTokens",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "efcca41d-7e45-49a4-ac4d-a1dc03b38dc9",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "24b326f2-dd87-4f4a-b130-9f1586d0b8d3"
            },
            {
              "ID": "cd841389-1ffe-4733-b675-b695bcd7d14f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b8e590b3-8e81-4a88-86af-edcab8e9c58f"
            },
            {
              "ID": "28669d60-d312-4cdb-bc42-be50f4051e7d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "673def08-877b-4e4d-a742-3a6cc66c961e"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "4cba7a7b-0191-4c45-9311-2fbf81ebb4ce",
          "ObjectID": null,
          "ObjectID_Tosave": "5b02b203-5c03-4688-ba89-44b8acc1f6dd",
          "QueryName": "FK_AspNetUserTokens_AspNetUsers",
          "DisplayName": "FK_AspNetUserTokens_AspNetUsers",
          "FilterLogic": null,
          "Fields": [],
          "Filters": {
            "Filters": [
              {
                "ID": "6c1a090a-bbc2-4102-be8a-3850b6bfdae4",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "7ab28132-e2d5-4e47-9f68-dc41219014dd"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "8b52df2c-3f30-4e44-82ab-3b7e18a916f9",
          "ObjectID": null,
          "ObjectID_Tosave": "5b02b203-5c03-4688-ba89-44b8acc1f6dd",
          "QueryName": "Default_AspNetUserTokens",
          "DisplayName": "Default_AspNetUserTokens",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "b772c114-76e6-490a-800f-6bc26564305b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "7883f6d2-8d5d-40d3-8989-1f356e291c23"
            },
            {
              "ID": "0397b55a-4c6b-4910-a86c-775425217a21",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b8e590b3-8e81-4a88-86af-edcab8e9c58f"
            },
            {
              "ID": "b10d7f4a-97f1-41ff-b6c5-7b18e3105269",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c0332d01-5e01-446c-b800-d7bc980832dd"
            },
            {
              "ID": "cf8b6de5-aad1-47ac-b617-85f195e12036",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "24b326f2-dd87-4f4a-b130-9f1586d0b8d3"
            },
            {
              "ID": "69709e32-9a6a-4109-8bf8-fa7d2377ad16",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "673def08-877b-4e4d-a742-3a6cc66c961e"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "ef2f493c-cb46-4728-bbfc-dcf238a32726",
          "ObjectID": null,
          "ObjectID_Tosave": "5b02b203-5c03-4688-ba89-44b8acc1f6dd",
          "QueryName": "DEV_AspNetUserTokens",
          "DisplayName": "DEV_AspNetUserTokens",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "1a6913e6-7b55-4994-880d-1a36288a138d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "673def08-877b-4e4d-a742-3a6cc66c961e"
            },
            {
              "ID": "36d6469b-0fb7-4225-8d22-60b4a09366b2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "24b326f2-dd87-4f4a-b130-9f1586d0b8d3"
            },
            {
              "ID": "d49d8608-4354-4936-b142-66face3f2d1c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c0332d01-5e01-446c-b800-d7bc980832dd"
            },
            {
              "ID": "c3052d54-2482-43e7-8d99-b66886755bd4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b8e590b3-8e81-4a88-86af-edcab8e9c58f"
            },
            {
              "ID": "a305c690-2f79-46ac-80e4-c664ea58a4b3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "7883f6d2-8d5d-40d3-8989-1f356e291c23"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "9f679d87-585d-4778-bac8-e751c10c47d6",
          "ObjectID": null,
          "ObjectID_Tosave": "5b02b203-5c03-4688-ba89-44b8acc1f6dd",
          "QueryName": "Detail_AspNetUserTokens",
          "DisplayName": "Detail_AspNetUserTokens",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "146b32db-8d87-4b2a-9d01-5889d183bc92",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c0332d01-5e01-446c-b800-d7bc980832dd"
            },
            {
              "ID": "f81bba4b-8ebb-4c87-8756-624f989f25d4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b8e590b3-8e81-4a88-86af-edcab8e9c58f"
            },
            {
              "ID": "4c9e62ec-3d7d-4d8d-a455-9b7d36c57813",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "7883f6d2-8d5d-40d3-8989-1f356e291c23"
            },
            {
              "ID": "4a4d12c6-ad86-43c1-af3c-b63b2ba88e12",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "24b326f2-dd87-4f4a-b130-9f1586d0b8d3"
            },
            {
              "ID": "e443ea66-736f-4b6c-99a3-b9ccdc2a82e2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "673def08-877b-4e4d-a742-3a6cc66c961e"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "4c8bf4b1-0337-4c87-b692-baf46d4067ee",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "LoginProvider",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "b8e590b3-8e81-4a88-86af-edcab8e9c58f"
              },
              {
                "ID": "8b31aaf8-27bb-45f1-9ecb-6f1acfa0ebde",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Name",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "673def08-877b-4e4d-a742-3a6cc66c961e"
              },
              {
                "ID": "4a0a88e6-e6c8-48a8-8493-c920b2f11edb",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "UserId",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "24b326f2-dd87-4f4a-b130-9f1586d0b8d3"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "def89155-62e2-4843-a9fd-26c89df95234",
              "ParameterName": "Name",
              "DataSourceQueryID": "9f679d87-585d-4778-bac8-e751c10c47d6",
              "MappingFieldName": "Name",
              "IsMandatory": false
            },
            {
              "ID": "70d4c777-7bd3-4cea-aa6c-4e89fc1cc4e6",
              "ParameterName": "UserId",
              "DataSourceQueryID": "9f679d87-585d-4778-bac8-e751c10c47d6",
              "MappingFieldName": "UserId",
              "IsMandatory": false
            },
            {
              "ID": "889646bb-09da-44e2-9ae2-e70b20c24dc0",
              "ParameterName": "LoginProvider",
              "DataSourceQueryID": "9f679d87-585d-4778-bac8-e751c10c47d6",
              "MappingFieldName": "LoginProvider",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "AspNetUserTokens",
      "Resources": null,
      "IsSystem": true,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "5b02b203-5c03-4688-ba89-44b8acc1f6dd",
      "AppObjectConfiguration": null,
      "AllowVersioning": false,
      "IsSupportBluePrint": false,
      "IsLocationTracking": false,
      "AllowSoftDelete": false,
      "IsReplicationNeeded": false,
      "IsCacheEnable": false,
      "CacheTtl": 0,
      "ConnectionId": "8ccb12d3-3a42-4871-8494-1b541a796ca2",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "905a3188-6e49-43ec-9c91-9a9077da6594",
        "UpdatedBy": null,
        "CreatedOn": "2024-06-25T12:17:43.617",
        "UpdatedOn": "2025-06-04T10:49:26",
        "IsSystemRecord": true,
        "AppId": null
      }
    },
    {
      "ID": "5da5918f-2748-434a-8a7f-470daf775a0f",
      "ObjectName": "RefreshTokens",
      "DisplayName": "RefreshTokens",
      "Description": "RefreshTokens",
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": false,
      "DeploymentStatus": 2,
      "Fields": [
        {
          "ID": "83c13415-320f-40b0-b792-30c488b7f0ea",
          "ObjectID": null,
          "ObjectID_Tosave": "5da5918f-2748-434a-8a7f-470daf775a0f",
          "FieldName": "UserId",
          "DisplayName": "UserId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "UserId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "c39ed66f-5f9e-4b41-bd18-3f319c4d1877",
          "ObjectID": null,
          "ObjectID_Tosave": "5da5918f-2748-434a-8a7f-470daf775a0f",
          "FieldName": "ExpiryDate",
          "DisplayName": "ExpiryDate",
          "FieldType": {
            "DataType": 6,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "ExpiryDate",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "50cb53a1-f5c4-468f-a067-4a473492154a",
          "ObjectID": null,
          "ObjectID_Tosave": "5da5918f-2748-434a-8a7f-470daf775a0f",
          "FieldName": "JwtId",
          "DisplayName": "JwtId",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "JwtId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "ce8b7378-c79d-4f48-848a-720627fd03dc",
          "ObjectID": null,
          "ObjectID_Tosave": "5da5918f-2748-434a-8a7f-470daf775a0f",
          "FieldName": "CreationDate",
          "DisplayName": "CreationDate",
          "FieldType": {
            "DataType": 6,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "CreationDate",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "2c3633ba-3035-4fd6-afd9-79fd6145d12c",
          "ObjectID": null,
          "ObjectID_Tosave": "5da5918f-2748-434a-8a7f-470daf775a0f",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "5DA5918F-2748-434A-8A7F-470DAF775A0F",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "9125f92d-8515-4460-b354-b35f804d33c7",
          "ObjectID": null,
          "ObjectID_Tosave": "5da5918f-2748-434a-8a7f-470daf775a0f",
          "FieldName": "Invalidated",
          "DisplayName": "Invalidated",
          "FieldType": {
            "DataType": 3,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Invalidated",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "9c5c6144-6e8f-4818-9c77-be44d21c4019",
          "ObjectID": null,
          "ObjectID_Tosave": "5da5918f-2748-434a-8a7f-470daf775a0f",
          "FieldName": "Token",
          "DisplayName": "Token",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Token",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "97d76787-b2c2-482e-afa0-c851beb72192",
          "ObjectID": null,
          "ObjectID_Tosave": "5da5918f-2748-434a-8a7f-470daf775a0f",
          "FieldName": "Used",
          "DisplayName": "Used",
          "FieldType": {
            "DataType": 3,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Used",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": null,
      "DataSourceQueries": [
        {
          "ID": "c0ed93f3-c13b-491d-abad-0bd94641ee09",
          "ObjectID": null,
          "ObjectID_Tosave": "5da5918f-2748-434a-8a7f-470daf775a0f",
          "QueryName": "Detail_RefreshTokens",
          "DisplayName": "Detail_RefreshTokens",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "a382158c-147b-49fa-a119-0c92b055b977",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9c5c6144-6e8f-4818-9c77-be44d21c4019"
            },
            {
              "ID": "777d2750-3420-4659-934d-1ed9be1ddbe5",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9125f92d-8515-4460-b354-b35f804d33c7"
            },
            {
              "ID": "a4d2a4a9-18b7-4d16-8ad6-2173c1fad877",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "97d76787-b2c2-482e-afa0-c851beb72192"
            },
            {
              "ID": "e80f1849-034d-4d47-993e-2820cdd7dc3b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "2c3633ba-3035-4fd6-afd9-79fd6145d12c"
            },
            {
              "ID": "ee4fa410-5ec7-49c0-8ede-76d4b40094da",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c39ed66f-5f9e-4b41-bd18-3f319c4d1877"
            },
            {
              "ID": "25628ba0-df22-45c4-880a-843c6a893eb8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "83c13415-320f-40b0-b792-30c488b7f0ea"
            },
            {
              "ID": "35936888-9741-4294-a21d-8a1e74657c3b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "50cb53a1-f5c4-468f-a067-4a473492154a"
            },
            {
              "ID": "38af800b-d31e-4195-9d20-9d519eb9fd4e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ce8b7378-c79d-4f48-848a-720627fd03dc"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "6884a801-03d5-4f46-a6bc-d2985ce12406",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Token",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "9c5c6144-6e8f-4818-9c77-be44d21c4019"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "391af1f7-aa8b-4cf6-aef5-a4bdb559a6d3",
              "ParameterName": "Token",
              "DataSourceQueryID": "c0ed93f3-c13b-491d-abad-0bd94641ee09",
              "MappingFieldName": "Token",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "6d26ff9c-38e4-4fe1-9d4c-21e715cd94dd",
          "ObjectID": null,
          "ObjectID_Tosave": "5da5918f-2748-434a-8a7f-470daf775a0f",
          "QueryName": "Default_RefreshTokens",
          "DisplayName": "Default_RefreshTokens",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "7ba8adb5-ec6d-477f-a05f-08ebe5de83a4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9125f92d-8515-4460-b354-b35f804d33c7"
            },
            {
              "ID": "150916eb-b17d-449c-813c-247a5e74f314",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9c5c6144-6e8f-4818-9c77-be44d21c4019"
            },
            {
              "ID": "c7b63cd3-56ee-4283-8acd-9a6ac019ee3c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "83c13415-320f-40b0-b792-30c488b7f0ea"
            },
            {
              "ID": "9d0b7da4-5fee-46c8-b07f-9b9098209894",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ce8b7378-c79d-4f48-848a-720627fd03dc"
            },
            {
              "ID": "6f81aa4a-84bb-460c-9d41-a0d1a9288da9",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "97d76787-b2c2-482e-afa0-c851beb72192"
            },
            {
              "ID": "8770ab1f-8222-4f53-b10d-a4924362da2a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "50cb53a1-f5c4-468f-a067-4a473492154a"
            },
            {
              "ID": "f382de54-f52c-446b-b3b2-b204ad57e72e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "2c3633ba-3035-4fd6-afd9-79fd6145d12c"
            },
            {
              "ID": "c81133f3-fac8-421c-872a-d9e75be964e4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c39ed66f-5f9e-4b41-bd18-3f319c4d1877"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "bde4c142-811f-4529-8ad6-74536b7b3d9e",
          "ObjectID": null,
          "ObjectID_Tosave": "5da5918f-2748-434a-8a7f-470daf775a0f",
          "QueryName": "DEV_RefreshTokens",
          "DisplayName": "DEV_RefreshTokens",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "a2ac163a-a756-4d83-9d78-2da72fc1ef3e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9c5c6144-6e8f-4818-9c77-be44d21c4019"
            },
            {
              "ID": "02bf1859-131f-434e-b52e-8e715db5ea82",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9125f92d-8515-4460-b354-b35f804d33c7"
            },
            {
              "ID": "fcbe7f26-09b1-4502-9fea-a937ec89a380",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ce8b7378-c79d-4f48-848a-720627fd03dc"
            },
            {
              "ID": "60c33e04-e82f-4728-81db-b2765f17c6c0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "2c3633ba-3035-4fd6-afd9-79fd6145d12c"
            },
            {
              "ID": "88de8ae6-af11-4d0c-8e84-b81c25619322",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "83c13415-320f-40b0-b792-30c488b7f0ea"
            },
            {
              "ID": "4932bb3a-6871-44e6-adba-be262b0c9b7a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c39ed66f-5f9e-4b41-bd18-3f319c4d1877"
            },
            {
              "ID": "3624937c-5552-4b08-82a9-e5db50aaf69c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "97d76787-b2c2-482e-afa0-c851beb72192"
            },
            {
              "ID": "0f52197c-eaac-47b5-b71e-f3daa264b256",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "50cb53a1-f5c4-468f-a067-4a473492154a"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "232c5dd8-6f3c-4d87-928e-bc1076803e4f",
          "ObjectID": null,
          "ObjectID_Tosave": "5da5918f-2748-434a-8a7f-470daf775a0f",
          "QueryName": "FK_RefreshTokens_AspNetUsers",
          "DisplayName": "FK_RefreshTokens_AspNetUsers",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "5c73d9d9-5d91-4c8c-b1db-1573a50126b0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "97d76787-b2c2-482e-afa0-c851beb72192"
            },
            {
              "ID": "d3075294-28b3-4a28-8b4d-2e12e079c40f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9c5c6144-6e8f-4818-9c77-be44d21c4019"
            },
            {
              "ID": "c54f6f96-2f0d-458c-9f4f-4c63c0ac03ac",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9125f92d-8515-4460-b354-b35f804d33c7"
            },
            {
              "ID": "8ccd9fff-30b3-403d-bb13-919bc79d9495",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "2c3633ba-3035-4fd6-afd9-79fd6145d12c"
            },
            {
              "ID": "352d5cc9-41d5-4549-b618-c39046503990",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c39ed66f-5f9e-4b41-bd18-3f319c4d1877"
            },
            {
              "ID": "06d7416e-aef1-4b37-ba6c-d3897bb7c328",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ce8b7378-c79d-4f48-848a-720627fd03dc"
            },
            {
              "ID": "d55463c9-5f12-4036-90b4-d72ecb4fea2e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "50cb53a1-f5c4-468f-a067-4a473492154a"
            },
            {
              "ID": "8011a58c-f51d-4603-8fa8-f4b7cbf55a49",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "83c13415-320f-40b0-b792-30c488b7f0ea"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "adceb4ab-7a9d-4e68-bff8-768b0e7b72f2",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "83c13415-320f-40b0-b792-30c488b7f0ea"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "a307fc59-2454-4346-a42b-8e5005a2e368",
              "ParameterName": "Id",
              "DataSourceQueryID": "232c5dd8-6f3c-4d87-928e-bc1076803e4f",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "f9e2cd42-628a-4b4d-9f72-c734cb73eede",
          "ObjectID": null,
          "ObjectID_Tosave": "5da5918f-2748-434a-8a7f-470daf775a0f",
          "QueryName": "List_RefreshTokens",
          "DisplayName": "List_RefreshTokens",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "5c4567f2-a7f4-464a-9bee-0802a690d281",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9c5c6144-6e8f-4818-9c77-be44d21c4019"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "RefreshTokens",
      "Resources": null,
      "IsSystem": true,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "5da5918f-2748-434a-8a7f-470daf775a0f",
      "AppObjectConfiguration": null,
      "AllowVersioning": false,
      "IsSupportBluePrint": false,
      "IsLocationTracking": false,
      "AllowSoftDelete": false,
      "IsReplicationNeeded": false,
      "IsCacheEnable": false,
      "CacheTtl": 0,
      "ConnectionId": "8ccb12d3-3a42-4871-8494-1b541a796ca2",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "905a3188-6e49-43ec-9c91-9a9077da6594",
        "UpdatedBy": null,
        "CreatedOn": "2024-06-25T12:17:43.617",
        "UpdatedOn": null,
        "IsSystemRecord": false,
        "AppId": null
      }
    },
    {
      "ID": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
      "ObjectName": "TABD_AppInfo",
      "DisplayName": "TABD_AppInfo",
      "Description": "TABD_AppInfo",
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": false,
      "DeploymentStatus": 2,
      "Fields": [
        {
          "ID": "fff99658-a56e-48dc-b425-1692a195d58c",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "FieldName": "AppVersion",
          "DisplayName": "AppVersion",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "AppVersion",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "39fe4516-525a-43bf-8b66-36096e85bda6",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "FieldName": "IsDefault",
          "DisplayName": "IsDefault",
          "FieldType": {
            "DataType": 3,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "IsDefault",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "af3c8716-3724-4111-a642-7113748a15d3",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "FBF404DE-FB43-4AAC-9C3B-3C62275D39A2",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "fda38c1b-ecc3-464a-af27-74718aa55273",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "FieldName": "AppDefinition",
          "DisplayName": "AppDefinition",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "AppDefinition",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "31ef5b32-13bd-42b3-a3e9-87c4d7d55fbc",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "FieldName": "Category",
          "DisplayName": "Category",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Category",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_App_Category",
            "LookupField": "Id",
            "DisplayField": "Name",
            "selectQuery": null
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "8f54dede-a210-4ce2-9343-8d4b0b14eac6",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "FieldName": "Description",
          "DisplayName": "Description",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Description",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "6fd5cc8b-effe-4ba4-9d7c-8df981554e8f",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "FieldName": "Id",
          "DisplayName": "Id",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Id",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "51c00294-b996-4d49-9848-8e1ebe7a042a",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "FieldName": "DisplayName",
          "DisplayName": "DisplayName",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "DisplayName",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "8d4851b1-4caa-413a-b390-a8f33ac87743",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "FieldName": "PlatformVersion",
          "DisplayName": "PlatformVersion",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "PlatformVersion",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "d60900a5-de61-460f-8310-cad7c1223f59",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "FieldName": "TenantId",
          "DisplayName": "TenantId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "TenantId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_OrgInfo",
            "LookupField": "Id",
            "DisplayField": "Id",
            "selectQuery": null
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "0aa1e3a8-3a67-42e6-89c9-cbfd32bd93fc",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "FieldName": "AppName",
          "DisplayName": "AppName",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "AppName",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "9436349e-7714-4b32-9b96-e4a631d3c8fa",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "FieldName": "Visibility",
          "DisplayName": "Visibility",
          "FieldType": {
            "DataType": 2,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Visibility",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": null,
      "DataSourceQueries": [
        {
          "ID": "f069547a-21c1-4218-9265-12b5de405f4c",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "QueryName": "Default_TABD_AppInfo",
          "DisplayName": "Default_TABD_AppInfo",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "061220d8-d332-4675-a6a3-18aea368f3e3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8d4851b1-4caa-413a-b390-a8f33ac87743"
            },
            {
              "ID": "faf34bb2-0440-42de-a8f9-1f1200100c82",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fff99658-a56e-48dc-b425-1692a195d58c"
            },
            {
              "ID": "7ed24afb-8fb9-4416-9792-26a6fec513b3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8f54dede-a210-4ce2-9343-8d4b0b14eac6"
            },
            {
              "ID": "982456ce-401c-4c6a-b2b4-363884805d75",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "af3c8716-3724-4111-a642-7113748a15d3"
            },
            {
              "ID": "7f58ed1b-44df-4421-a5ab-5665a7dc530b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d60900a5-de61-460f-8310-cad7c1223f59"
            },
            {
              "ID": "857fccab-fec7-4c74-bf76-76de0034e2b4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "51c00294-b996-4d49-9848-8e1ebe7a042a"
            },
            {
              "ID": "ddce2556-edc1-4fe8-b14b-8abe2f764f36",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6fd5cc8b-effe-4ba4-9d7c-8df981554e8f"
            },
            {
              "ID": "446b3360-fc45-4479-b234-d2204cac54ec",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fda38c1b-ecc3-464a-af27-74718aa55273"
            },
            {
              "ID": "55651001-2430-4f9a-b5b7-ec914a8695f8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0aa1e3a8-3a67-42e6-89c9-cbfd32bd93fc"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "7ab60ba2-88ee-4df7-a109-14a4aa1ac7a8",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "QueryName": "FK_TABD_AppInfo_TABD_OrgInfo",
          "DisplayName": "FK_TABD_AppInfo_TABD_OrgInfo",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "f88ecdef-fe18-42e5-a459-15d0a59d3390",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "51c00294-b996-4d49-9848-8e1ebe7a042a"
            },
            {
              "ID": "8df87859-57dd-4830-bcc5-1834a66a237c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d60900a5-de61-460f-8310-cad7c1223f59"
            },
            {
              "ID": "a771f3e9-c162-467a-b20b-748e0529c54b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8d4851b1-4caa-413a-b390-a8f33ac87743"
            },
            {
              "ID": "b78887bd-648b-4572-ba01-78e9b129b851",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fda38c1b-ecc3-464a-af27-74718aa55273"
            },
            {
              "ID": "dc54c2dd-324e-412f-8d24-7c345a7e459b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "af3c8716-3724-4111-a642-7113748a15d3"
            },
            {
              "ID": "23c39037-7a4f-4d47-8b83-8cfdcf34de91",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fff99658-a56e-48dc-b425-1692a195d58c"
            },
            {
              "ID": "7798e76a-f352-4d79-83d4-aa2192b37869",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6fd5cc8b-effe-4ba4-9d7c-8df981554e8f"
            },
            {
              "ID": "7c25c7cf-6e79-4148-8016-c798b2005bce",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8f54dede-a210-4ce2-9343-8d4b0b14eac6"
            },
            {
              "ID": "ab5c1638-7a6a-40f5-b610-ce26c51207e7",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0aa1e3a8-3a67-42e6-89c9-cbfd32bd93fc"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "38675a28-9468-4dca-9c60-73f62fe14791",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "d60900a5-de61-460f-8310-cad7c1223f59"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "42801e42-30c4-46a7-b2af-0666cff9a6d1",
              "ParameterName": "Id",
              "DataSourceQueryID": "7ab60ba2-88ee-4df7-a109-14a4aa1ac7a8",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "aac2e5d7-006d-4f2b-ab5b-1776d62d3e7a",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "QueryName": "DEV_TABD_AppInfo",
          "DisplayName": "DEV_TABD_AppInfo",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "cdc5340e-16b7-4798-8bfe-02a25a0ee7a8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d60900a5-de61-460f-8310-cad7c1223f59"
            },
            {
              "ID": "957188e5-4c42-4931-8049-2fc5fe7fc145",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "51c00294-b996-4d49-9848-8e1ebe7a042a"
            },
            {
              "ID": "f048f4d4-746b-4640-a3dc-4ae3d6160dd4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "af3c8716-3724-4111-a642-7113748a15d3"
            },
            {
              "ID": "81578fb0-5757-4c77-8d22-4f4220d93ec7",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6fd5cc8b-effe-4ba4-9d7c-8df981554e8f"
            },
            {
              "ID": "2c891e57-ea2f-4d12-aa41-65cc8179a871",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fda38c1b-ecc3-464a-af27-74718aa55273"
            },
            {
              "ID": "39426476-f435-45d7-a93d-6836385a6ce0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0aa1e3a8-3a67-42e6-89c9-cbfd32bd93fc"
            },
            {
              "ID": "f2e20739-c614-42fb-a785-a6d276da783d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8f54dede-a210-4ce2-9343-8d4b0b14eac6"
            },
            {
              "ID": "1d11fc60-60e6-4c67-8367-b222351984a3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8d4851b1-4caa-413a-b390-a8f33ac87743"
            },
            {
              "ID": "3427de64-54d7-45c5-8032-e34668ee7674",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fff99658-a56e-48dc-b425-1692a195d58c"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "71c786d3-9049-4a12-975f-1850e746ebaf",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "QueryName": "List_AppInfo_RecordId",
          "DisplayName": "List_AppInfo_RecordId",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "054be986-e897-44ee-97da-316a2a0203d2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.RecordId",
              "AppFieldID": "d3661c2c-e872-4f5a-9030-4c8f97c704c5"
            },
            {
              "ID": "304edeef-648a-468f-9f5e-9e850a123f13",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "51c00294-b996-4d49-9848-8e1ebe7a042a"
            },
            {
              "ID": "c2ab7280-6779-4516-bf9e-ca0981ab0eb9",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0aa1e3a8-3a67-42e6-89c9-cbfd32bd93fc"
            },
            {
              "ID": "9c719151-ba3b-4673-be28-d68a488bd250",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6fd5cc8b-effe-4ba4-9d7c-8df981554e8f"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "8cb2ae59-3006-42d7-b118-30dcb852547e",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "QueryName": "Get_App_Detail",
          "DisplayName": "Get_App_Detail",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "7295a2d6-4ad3-46dc-aaf4-0417475373b2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6fd5cc8b-effe-4ba4-9d7c-8df981554e8f"
            },
            {
              "ID": "9e8af061-9329-4409-9c7f-9851554c169f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "51c00294-b996-4d49-9848-8e1ebe7a042a"
            },
            {
              "ID": "fe7f29ab-a6e4-4487-898c-a3dfbbcfad4e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0aa1e3a8-3a67-42e6-89c9-cbfd32bd93fc"
            },
            {
              "ID": "409a86e7-58cc-4b77-a287-d9bc65263c98",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "TenantId.Id",
              "AppFieldID": "f602a1af-d0c7-4f46-8da0-6ec56bb98e2b"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 2,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "AppName",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "0aa1e3a8-3a67-42e6-89c9-cbfd32bd93fc"
              },
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 2,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "AppId",
                "Sequence": 2,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "6fd5cc8b-effe-4ba4-9d7c-8df981554e8f"
              },
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 2,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "TenantId",
                "Sequence": 3,
                "GroupID": 1,
                "LookupDetail": "TenantId.Id",
                "FieldType": 2,
                "FieldID": "f602a1af-d0c7-4f46-8da0-6ec56bb98e2b"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "1bbb147d-1590-405a-9a1e-23377474cefd",
              "ParameterName": "AppName",
              "DataSourceQueryID": "8cb2ae59-3006-42d7-b118-30dcb852547e",
              "MappingFieldName": "AppName",
              "IsMandatory": false
            },
            {
              "ID": "62d8f827-dc23-4f4c-a36c-4da61b479532",
              "ParameterName": "AppId",
              "DataSourceQueryID": "8cb2ae59-3006-42d7-b118-30dcb852547e",
              "MappingFieldName": "AppId",
              "IsMandatory": false
            },
            {
              "ID": "3e0a236a-b47e-48c9-bf66-d362adc25de9",
              "ParameterName": "TenantId",
              "DataSourceQueryID": "8cb2ae59-3006-42d7-b118-30dcb852547e",
              "MappingFieldName": "TenantId",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "a1af8e51-c5ab-4f31-b3cb-3101acc972b7",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "QueryName": "List_TABD_AppInfo",
          "DisplayName": "List_TABD_AppInfo",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "25d5eb5b-27c8-4c81-887b-49047c09f394",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "51c00294-b996-4d49-9848-8e1ebe7a042a"
            },
            {
              "ID": "2c3b6daa-a194-4f85-965a-adf4a2bcf31e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6fd5cc8b-effe-4ba4-9d7c-8df981554e8f"
            },
            {
              "ID": "81a5b5f4-d9c2-48e3-ad4b-d8395649d116",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0aa1e3a8-3a67-42e6-89c9-cbfd32bd93fc"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "6a53735b-36eb-4ea9-9533-57870d5dab91",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "QueryName": "Detail_TABD_AppInfo",
          "DisplayName": "Detail_TABD_AppInfo",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "bd47fbd2-b8cd-49a4-b42d-2014261606fa",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "Category.Id",
              "AppFieldID": "e366630a-6b56-4a75-9275-ae6132b65e86"
            },
            {
              "ID": "40f33d28-82e7-4326-9758-216d618edc6f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d60900a5-de61-460f-8310-cad7c1223f59"
            },
            {
              "ID": "74c91dc4-51a9-445e-9194-34c7f0f1c8cb",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "51c00294-b996-4d49-9848-8e1ebe7a042a"
            },
            {
              "ID": "0f67fc5d-48cd-4f86-af6a-4340c031c48f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fff99658-a56e-48dc-b425-1692a195d58c"
            },
            {
              "ID": "90bb6fd4-f574-437c-a21d-582d80682538",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.TenantId",
              "AppFieldID": "f9a5bee3-f20c-47db-bbd4-ac0d972985f5"
            },
            {
              "ID": "1acbf013-4c1c-40bb-9b6b-5b4ebc533c48",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0aa1e3a8-3a67-42e6-89c9-cbfd32bd93fc"
            },
            {
              "ID": "00b2d982-e24b-40a5-b571-63e4884503f0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.RecordId",
              "AppFieldID": "d3661c2c-e872-4f5a-9030-4c8f97c704c5"
            },
            {
              "ID": "f03432b9-2b7a-4e40-8dca-6688001c789f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.Icon",
              "AppFieldID": "29671db8-c66f-4639-b1cd-11e1535088dd"
            },
            {
              "ID": "6cd481b6-4032-4067-adde-6fb233114fd2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "39fe4516-525a-43bf-8b66-36096e85bda6"
            },
            {
              "ID": "649287fd-3e1f-491e-b23e-700979c8b9e1",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8d4851b1-4caa-413a-b390-a8f33ac87743"
            },
            {
              "ID": "c4c17296-d157-43ce-afde-77035d2e0093",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fda38c1b-ecc3-464a-af27-74718aa55273"
            },
            {
              "ID": "8a8113f9-428e-49b3-82c6-a4cc1f4e588b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9436349e-7714-4b32-9b96-e4a631d3c8fa"
            },
            {
              "ID": "e0aeeeae-c853-49af-9464-bed9e4281245",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "Category.Name",
              "AppFieldID": "ab942395-e68b-4ded-a1d5-fb17fd23dc5a"
            },
            {
              "ID": "3a2de122-142e-463d-8aed-c1a9d4eedfee",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6fd5cc8b-effe-4ba4-9d7c-8df981554e8f"
            },
            {
              "ID": "e22b1855-f064-4a73-8c30-e0b88d9ab8b5",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.BlueprintStatusId",
              "AppFieldID": "3c4d1c3e-a3a6-44bd-a815-a9c6cfbe003c"
            },
            {
              "ID": "4bbf5890-66fc-4e49-824d-e305fbd24635",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.PrimaryKey",
              "AppFieldID": "1765e7e6-c1f1-454d-abcf-2584ed643720"
            },
            {
              "ID": "86c7e9de-3c26-4f97-ac24-e7071639f6b3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.BlueprintId",
              "AppFieldID": "5ec8bdd1-2da3-4759-855a-e2eccf767d35"
            },
            {
              "ID": "a059a7e7-a0d5-4363-9d53-f1c396871267",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8f54dede-a210-4ce2-9343-8d4b0b14eac6"
            },
            {
              "ID": "491517de-0535-4348-9e07-fcee96b70974",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.AppObjectID",
              "AppFieldID": "497cbcb0-e5eb-4fcd-84d3-bebc4348069e"
            },
            {
              "ID": "8cd1d1a3-ee80-4ccb-b286-fd9b13dcb89e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.IsSystemRecord",
              "AppFieldID": "7c3e041e-6086-48f0-9ba8-61da0e241b29"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "c6474696-df9e-421d-945c-50195c37e2a9",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "6fd5cc8b-effe-4ba4-9d7c-8df981554e8f"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "9e467a31-6a1a-42a2-a107-1070d7d66092",
              "ParameterName": "Id",
              "DataSourceQueryID": "6a53735b-36eb-4ea9-9533-57870d5dab91",
              "MappingFieldName": "Id",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "1d4b6a63-a983-4050-a338-6cb466cdec90",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "QueryName": "get_AppDetails_TABD_AppInfo",
          "DisplayName": "get_AppDetails_TABD_AppInfo",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "2993d052-37a2-48ae-93a5-13752a41bccb",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6fd5cc8b-effe-4ba4-9d7c-8df981554e8f"
            },
            {
              "ID": "f9bb203b-9825-4ab6-abac-14c19c5f1a94",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.RecordId",
              "AppFieldID": "d3661c2c-e872-4f5a-9030-4c8f97c704c5"
            },
            {
              "ID": "cceda034-d050-47f1-b7b1-35f81dfa4783",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8f54dede-a210-4ce2-9343-8d4b0b14eac6"
            },
            {
              "ID": "06e6d1d0-2593-4aae-a8be-6e65297fc4aa",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.Icon",
              "AppFieldID": "29671db8-c66f-4639-b1cd-11e1535088dd"
            },
            {
              "ID": "74ba8aaa-b450-4fc5-895c-734cab7566be",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d60900a5-de61-460f-8310-cad7c1223f59"
            },
            {
              "ID": "bdc1b9fc-4ddd-4d1b-b812-77bce0da52db",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "51c00294-b996-4d49-9848-8e1ebe7a042a"
            },
            {
              "ID": "2770670c-508f-4874-831e-9fbd72c1cc9a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fda38c1b-ecc3-464a-af27-74718aa55273"
            },
            {
              "ID": "33b4ba1a-b74f-4ec6-8097-d6757b690c8d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9436349e-7714-4b32-9b96-e4a631d3c8fa"
            },
            {
              "ID": "6d097d0d-2a40-4fa3-8f23-dfc8d22ffe36",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "39fe4516-525a-43bf-8b66-36096e85bda6"
            },
            {
              "ID": "cb35c445-2c3f-49ec-83aa-f70a7dbe2935",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "31ef5b32-13bd-42b3-a3e9-87c4d7d55fbc"
            },
            {
              "ID": "01e9dc26-ea3f-4d0a-a704-f948b45d45b4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0aa1e3a8-3a67-42e6-89c9-cbfd32bd93fc"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "6fd5cc8b-effe-4ba4-9d7c-8df981554e8f"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "8ace5290-672b-4403-b393-b95fda120ff4",
              "ParameterName": "Id",
              "DataSourceQueryID": "1d4b6a63-a983-4050-a338-6cb466cdec90",
              "MappingFieldName": "Id",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "789b089d-6bc9-48a4-8192-918dd21da940",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "QueryName": "Get_Marketplace_Apps",
          "DisplayName": "Get_Marketplace_Apps",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "22c647a7-509f-416c-b999-1013f608faea",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8f54dede-a210-4ce2-9343-8d4b0b14eac6"
            },
            {
              "ID": "ed811be7-54cb-4938-b2e1-2a62c3721e24",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "31ef5b32-13bd-42b3-a3e9-87c4d7d55fbc"
            },
            {
              "ID": "c7d5565d-5b1d-460c-ac5f-5fb1e8eeada4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0aa1e3a8-3a67-42e6-89c9-cbfd32bd93fc"
            },
            {
              "ID": "ba61d419-a1c0-4dca-bf6f-6f1fe373f06a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "51c00294-b996-4d49-9848-8e1ebe7a042a"
            },
            {
              "ID": "110d8987-d268-4a0e-81d9-a3258b7f35f4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fff99658-a56e-48dc-b425-1692a195d58c"
            },
            {
              "ID": "7071b676-86cd-4b6a-abfd-bea613b2f644",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8d4851b1-4caa-413a-b390-a8f33ac87743"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "57206137-83d1-4a35-822c-beaab98463d3",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "QueryName": "Get_Tenant_Subscribed_Apps",
          "DisplayName": "Get_Tenant_Subscribed_Apps",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "78448e6c-9d5f-43f3-94a7-0a466b9c00ef",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fff99658-a56e-48dc-b425-1692a195d58c"
            },
            {
              "ID": "a000fac1-d39e-4625-a566-af445b9446c6",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "51c00294-b996-4d49-9848-8e1ebe7a042a"
            },
            {
              "ID": "7a18551f-b3d0-437f-b060-bc977d5933ba",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0aa1e3a8-3a67-42e6-89c9-cbfd32bd93fc"
            },
            {
              "ID": "a3bab2e5-87c5-4b25-a978-ea112b9fe49a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8d4851b1-4caa-413a-b390-a8f33ac87743"
            },
            {
              "ID": "3b403269-29f4-4309-8724-f28441a0b489",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8f54dede-a210-4ce2-9343-8d4b0b14eac6"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "TenantId",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": "TenantId.Id",
                "FieldType": 2,
                "FieldID": "f602a1af-d0c7-4f46-8da0-6ec56bb98e2b"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "55820f4f-7c71-42af-ac16-9a8ff56be219",
              "ParameterName": "TenantId",
              "DataSourceQueryID": "57206137-83d1-4a35-822c-beaab98463d3",
              "MappingFieldName": "TenantId",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "c0647911-ca50-4baa-9bd0-ed8a63308413",
          "ObjectID": null,
          "ObjectID_Tosave": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
          "QueryName": "List_Tenantwise_TABD_AppInfo",
          "DisplayName": "List_Tenantwise_TABD_AppInfo",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "18de5e1b-7b47-4736-9b17-3a0990703c95",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "TenantId.Id",
              "AppFieldID": "f602a1af-d0c7-4f46-8da0-6ec56bb98e2b"
            },
            {
              "ID": "97c4f0ad-e042-4d30-be50-6dd38024dd05",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6fd5cc8b-effe-4ba4-9d7c-8df981554e8f"
            },
            {
              "ID": "4dca3a35-fdee-420d-87fb-8879205a1f9e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "TenantId.OrganizationName",
              "AppFieldID": "2731cc04-e7e0-4c27-8083-1bbde043ba5a"
            },
            {
              "ID": "3bfcf61f-be59-49f8-a3c9-8d57d57fd933",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0aa1e3a8-3a67-42e6-89c9-cbfd32bd93fc"
            },
            {
              "ID": "2aaf6daa-aa13-453f-ac3d-d3c40303dfe5",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "51c00294-b996-4d49-9848-8e1ebe7a042a"
            },
            {
              "ID": "b324fa29-e4b8-401a-b034-fdf21a24e915",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.OWNER",
              "AppFieldID": "ed23fc5d-015d-4023-997c-e455dc3cdf6d"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "TenantId",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "d60900a5-de61-460f-8310-cad7c1223f59"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "2bd33f3e-df5a-4984-a2af-5d3653f0495c",
              "ParameterName": "TenantId",
              "DataSourceQueryID": "c0647911-ca50-4baa-9bd0-ed8a63308413",
              "MappingFieldName": "TenantId",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "TABD_AppInfo",
      "Resources": null,
      "IsSystem": true,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "fbf404de-fb43-4aac-9c3b-3c62275d39a2",
      "AppObjectConfiguration": null,
      "AllowVersioning": false,
      "IsSupportBluePrint": false,
      "IsLocationTracking": false,
      "AllowSoftDelete": false,
      "IsReplicationNeeded": false,
      "IsCacheEnable": false,
      "CacheTtl": 0,
      "ConnectionId": "8ccb12d3-3a42-4871-8494-1b541a796ca2",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "905a3188-6e49-43ec-9c91-9a9077da6594",
        "UpdatedBy": null,
        "CreatedOn": "2024-06-25T12:17:43.617",
        "UpdatedOn": null,
        "IsSystemRecord": false,
        "AppId": null
      }
    },
    {
      "ID": "6e1fd064-10cc-4b04-844b-b17cb575ee82",
      "ObjectName": "TABD_AppPackages",
      "DisplayName": "TABD_AppPackages",
      "Description": "TABD_AppPackages",
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": false,
      "DeploymentStatus": 2,
      "Fields": [
        {
          "ID": "a5558f06-d9e9-4cfe-be23-0b8fada1c35c",
          "ObjectID": null,
          "ObjectID_Tosave": "6e1fd064-10cc-4b04-844b-b17cb575ee82",
          "FieldName": "Features",
          "DisplayName": "Features",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Features",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "21eaca51-0346-40f7-a2e3-20680ef178df",
          "ObjectID": null,
          "ObjectID_Tosave": "6e1fd064-10cc-4b04-844b-b17cb575ee82",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "6E1FD064-10CC-4B04-844B-B17CB575EE82",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "b0f47c69-5178-41cc-b385-63ea8f30d3e6",
          "ObjectID": null,
          "ObjectID_Tosave": "6e1fd064-10cc-4b04-844b-b17cb575ee82",
          "FieldName": "Id",
          "DisplayName": "Id",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Id",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "6cb323dc-d502-4378-807e-776ac7f17422",
          "ObjectID": null,
          "ObjectID_Tosave": "6e1fd064-10cc-4b04-844b-b17cb575ee82",
          "FieldName": "Price",
          "DisplayName": "Price",
          "FieldType": {
            "DataType": 4,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Price",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "f09e5bed-e627-4007-a050-7915ec3417b5",
          "ObjectID": null,
          "ObjectID_Tosave": "6e1fd064-10cc-4b04-844b-b17cb575ee82",
          "FieldName": "Name",
          "DisplayName": "Name",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Name",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": null,
      "DataSourceQueries": [
        {
          "ID": "a028f4f8-45da-4b96-a71e-01689066b141",
          "ObjectID": null,
          "ObjectID_Tosave": "6e1fd064-10cc-4b04-844b-b17cb575ee82",
          "QueryName": "GetAppPackages_TABD_AppPackages",
          "DisplayName": "GetAppPackages_TABD_AppPackages",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "2600ad89-b5ae-42ca-9e37-00ef2bcd69e8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "f09e5bed-e627-4007-a050-7915ec3417b5"
            },
            {
              "ID": "8d2b8f2d-6001-42be-be9a-21a46c81ed2f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6cb323dc-d502-4378-807e-776ac7f17422"
            },
            {
              "ID": "50909ffa-2a3c-4871-bef4-858603d469c0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.AppId",
              "AppFieldID": "8451b996-3355-48d7-bb71-f0a0c8753308"
            },
            {
              "ID": "127f6589-5552-4803-a59c-aa2fb9c7d264",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.RecordId",
              "AppFieldID": "d3661c2c-e872-4f5a-9030-4c8f97c704c5"
            },
            {
              "ID": "a48175f6-75bf-4ecc-9294-ca10c508b291",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b0f47c69-5178-41cc-b385-63ea8f30d3e6"
            },
            {
              "ID": "f88e8b87-9999-4f35-ae5e-cd3010116957",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "a5558f06-d9e9-4cfe-be23-0b8fada1c35c"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "AppId",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": "RecordInfo.AppId",
                "FieldType": 2,
                "FieldID": "8451b996-3355-48d7-bb71-f0a0c8753308"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "e3a7c390-f4e1-4e11-9844-68b7855f89b8",
              "ParameterName": "AppId",
              "DataSourceQueryID": "a028f4f8-45da-4b96-a71e-01689066b141",
              "MappingFieldName": "AppId",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "09ce694c-fac4-492f-bbe9-43444dc34292",
          "ObjectID": null,
          "ObjectID_Tosave": "6e1fd064-10cc-4b04-844b-b17cb575ee82",
          "QueryName": "Test_TABD_AppPackages",
          "DisplayName": "Test_TABD_AppPackages",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "c6610577-10c5-4460-bc5b-587044d0f73f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6cb323dc-d502-4378-807e-776ac7f17422"
            },
            {
              "ID": "aa17ac9c-7c25-49a5-a41b-5e3e23e8b0f8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b0f47c69-5178-41cc-b385-63ea8f30d3e6"
            },
            {
              "ID": "e58ef708-696c-421c-a733-d31257e40eea",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "f09e5bed-e627-4007-a050-7915ec3417b5"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "e037da90-39e3-48f5-a780-6892586de184",
          "ObjectID": null,
          "ObjectID_Tosave": "6e1fd064-10cc-4b04-844b-b17cb575ee82",
          "QueryName": "Detail_TABD_AppPackages",
          "DisplayName": "Detail_TABD_AppPackages",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "a3d87462-6e7d-471e-a959-5c545d3d75f5",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.AppId",
              "AppFieldID": "8451b996-3355-48d7-bb71-f0a0c8753308"
            },
            {
              "ID": "875f4c4b-22ed-4e97-8ba9-6bbfdb61e138",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6cb323dc-d502-4378-807e-776ac7f17422"
            },
            {
              "ID": "a56d6a46-7e20-4fc4-8498-83d70ef5cdd2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "f09e5bed-e627-4007-a050-7915ec3417b5"
            },
            {
              "ID": "a9a05e1b-cabd-42df-b0a8-ac46192c670e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "a5558f06-d9e9-4cfe-be23-0b8fada1c35c"
            },
            {
              "ID": "d0a50f08-14d9-4c12-9468-c63dcd926bb0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b0f47c69-5178-41cc-b385-63ea8f30d3e6"
            },
            {
              "ID": "d01099ad-afa3-4b00-aeac-e7e2dcb097ac",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.RecordId",
              "AppFieldID": "d3661c2c-e872-4f5a-9030-4c8f97c704c5"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "8ec4fce8-f574-4893-9858-e9ab211b6b42",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "b0f47c69-5178-41cc-b385-63ea8f30d3e6"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "a6329751-aaf7-4b81-b699-77ce4b27e680",
              "ParameterName": "Id",
              "DataSourceQueryID": "e037da90-39e3-48f5-a780-6892586de184",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "778e6d2a-991b-4a29-9fe5-8dad831bdbe2",
          "ObjectID": null,
          "ObjectID_Tosave": "6e1fd064-10cc-4b04-844b-b17cb575ee82",
          "QueryName": "DEV_TABD_AppPackages",
          "DisplayName": "DEV_TABD_AppPackages",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "2b8fe617-a72f-415e-8ef7-16eab9e48674",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "21eaca51-0346-40f7-a2e3-20680ef178df"
            },
            {
              "ID": "6e65175b-0bbb-4a5a-b6fc-22859ca68d42",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "a589e2aa-cf79-40f6-a66c-f5f2737e5958"
            },
            {
              "ID": "deb3bce6-d73d-4438-8528-717c9c7eb85d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "a5558f06-d9e9-4cfe-be23-0b8fada1c35c"
            },
            {
              "ID": "da308008-4f8f-4a1a-9f81-8a4e6bb71f94",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6cb323dc-d502-4378-807e-776ac7f17422"
            },
            {
              "ID": "76433d73-b480-452a-8ad1-d964da8a0e2f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b0f47c69-5178-41cc-b385-63ea8f30d3e6"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "6e9de741-7b1f-44cb-a7c8-b01b981e31f5",
          "ObjectID": null,
          "ObjectID_Tosave": "6e1fd064-10cc-4b04-844b-b17cb575ee82",
          "QueryName": "Default_TABD_AppPackages",
          "DisplayName": "Default_TABD_AppPackages",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "8fddb771-574f-414f-a9b2-25af393a90fd",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b0f47c69-5178-41cc-b385-63ea8f30d3e6"
            },
            {
              "ID": "ac71f4d9-66ab-4f55-94d3-3a203d3d3364",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6cb323dc-d502-4378-807e-776ac7f17422"
            },
            {
              "ID": "b51433d6-5a56-4d0f-9308-4b3fe220d6f1",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "a5558f06-d9e9-4cfe-be23-0b8fada1c35c"
            },
            {
              "ID": "431c9481-5f04-4ee7-9469-5d9ffdf0eb51",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "f09e5bed-e627-4007-a050-7915ec3417b5"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "c5c93644-207b-4f37-a846-b66ba5cf4bf5",
          "ObjectID": null,
          "ObjectID_Tosave": "6e1fd064-10cc-4b04-844b-b17cb575ee82",
          "QueryName": "List_TABD_AppPackages",
          "DisplayName": "List_TABD_AppPackages",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "8383c800-96cb-440e-8948-16d05cf3fb16",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b0f47c69-5178-41cc-b385-63ea8f30d3e6"
            },
            {
              "ID": "5ec6bcff-18c1-4021-a015-20506b4083b3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "f09e5bed-e627-4007-a050-7915ec3417b5"
            },
            {
              "ID": "25fafe01-8135-483c-8233-346ec36548e0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.RecordId",
              "AppFieldID": "d3661c2c-e872-4f5a-9030-4c8f97c704c5"
            },
            {
              "ID": "335a9d94-4f8e-4119-a9ed-8f20d0f94a2b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.AppId",
              "AppFieldID": "8451b996-3355-48d7-bb71-f0a0c8753308"
            },
            {
              "ID": "688d8315-31bc-4d53-8a16-a271bbd7bc93",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "a5558f06-d9e9-4cfe-be23-0b8fada1c35c"
            },
            {
              "ID": "55abaa59-ec8a-4545-aec3-d455c9a119bb",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6cb323dc-d502-4378-807e-776ac7f17422"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 2,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "appId",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": "RecordInfo.AppId",
                "FieldType": 2,
                "FieldID": "8451b996-3355-48d7-bb71-f0a0c8753308"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "c81de9e0-8e25-4d05-940e-208accfa3c48",
              "ParameterName": "appId",
              "DataSourceQueryID": "c5c93644-207b-4f37-a846-b66ba5cf4bf5",
              "MappingFieldName": "appId",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "7bfe9f40-fe30-4d3e-98c1-f56b8a05b6c8",
          "ObjectID": null,
          "ObjectID_Tosave": "6e1fd064-10cc-4b04-844b-b17cb575ee82",
          "QueryName": "Preview_TABD_AppPackages",
          "DisplayName": "Preview_TABD_AppPackages",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "23fb980f-9038-4ab0-94aa-4f69f62cbac4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b0f47c69-5178-41cc-b385-63ea8f30d3e6"
            },
            {
              "ID": "ed089d1d-758c-45c7-9173-a1a52dcce711",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "a5558f06-d9e9-4cfe-be23-0b8fada1c35c"
            },
            {
              "ID": "e6c2bf90-dd26-4b89-9982-c70587a1c6ba",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6cb323dc-d502-4378-807e-776ac7f17422"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "d4ca350f-3600-4699-bea3-30943e88fa14",
              "ParameterName": "Id",
              "DataSourceQueryID": "7bfe9f40-fe30-4d3e-98c1-f56b8a05b6c8",
              "MappingFieldName": "Id",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "TABD_AppPackages",
      "Resources": null,
      "IsSystem": true,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "6e1fd064-10cc-4b04-844b-b17cb575ee82",
      "AppObjectConfiguration": null,
      "AllowVersioning": false,
      "IsSupportBluePrint": false,
      "IsLocationTracking": false,
      "AllowSoftDelete": false,
      "IsReplicationNeeded": false,
      "IsCacheEnable": false,
      "CacheTtl": 0,
      "ConnectionId": "8ccb12d3-3a42-4871-8494-1b541a796ca2",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "905a3188-6e49-43ec-9c91-9a9077da6594",
        "UpdatedBy": null,
        "CreatedOn": "2024-06-25T12:17:43.617",
        "UpdatedOn": null,
        "IsSystemRecord": false,
        "AppId": null
      }
    },
    {
      "ID": "ac00803d-d1d0-4a55-a794-48bb6ac59a64",
      "ObjectName": "TABD_Attachments",
      "DisplayName": "TABD_Attachments",
      "Description": "TABD_Attachments",
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": false,
      "DeploymentStatus": 2,
      "Fields": [
        {
          "ID": "52f30b19-cf0d-4f63-b4c0-9ffaa1003e57",
          "ObjectID": null,
          "ObjectID_Tosave": "ac00803d-d1d0-4a55-a794-48bb6ac59a64",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "AC00803D-D1D0-4A55-A794-48BB6AC59A64",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "3b77816d-6cf0-406d-83a7-a42aff8a1343",
          "ObjectID": null,
          "ObjectID_Tosave": "ac00803d-d1d0-4a55-a794-48bb6ac59a64",
          "FieldName": "MediaId",
          "DisplayName": "MediaId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "MediaId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_Media",
            "LookupField": "Id",
            "DisplayField": "Id",
            "selectQuery": null
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "2eafa523-5277-414f-84b4-dffe2b11f23c",
          "ObjectID": null,
          "ObjectID_Tosave": "ac00803d-d1d0-4a55-a794-48bb6ac59a64",
          "FieldName": "Id",
          "DisplayName": "Id",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Id",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "82002cfc-e52b-4bd0-baa7-f5f594f5e19d",
          "ObjectID": null,
          "ObjectID_Tosave": "ac00803d-d1d0-4a55-a794-48bb6ac59a64",
          "FieldName": "RecordId",
          "DisplayName": "RecordId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "9c59fe66-61a4-4961-9cad-fb76b1a56762",
          "ObjectID": null,
          "ObjectID_Tosave": "ac00803d-d1d0-4a55-a794-48bb6ac59a64",
          "FieldName": "CapturedOn",
          "DisplayName": "CapturedOn",
          "FieldType": {
            "DataType": 6,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "CapturedOn",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": [
        {
          "childDetails": {
            "LookupObject": "TABD_Media",
            "LookupField": "Id",
            "DisplayField": null,
            "selectQuery": null
          },
          "LocalId": "MediaId"
        }
      ],
      "DataSourceQueries": [
        {
          "ID": "8d790603-9c5b-41fe-8115-0626b64e5730",
          "ObjectID": null,
          "ObjectID_Tosave": "ac00803d-d1d0-4a55-a794-48bb6ac59a64",
          "QueryName": "DEV_TABD_Attachments",
          "DisplayName": "DEV_TABD_Attachments",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "c4facd16-af0d-49a2-97c1-3a3e35bdcf30",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9c59fe66-61a4-4961-9cad-fb76b1a56762"
            },
            {
              "ID": "8bd494d1-8d27-46a6-b364-81fa5fcc49c4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "82002cfc-e52b-4bd0-baa7-f5f594f5e19d"
            },
            {
              "ID": "a7bad6c9-6728-4214-9b46-a497d6fa3170",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "2eafa523-5277-414f-84b4-dffe2b11f23c"
            },
            {
              "ID": "e1d2df21-20b7-4ffc-b1f0-cb3872db2699",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "52f30b19-cf0d-4f63-b4c0-9ffaa1003e57"
            },
            {
              "ID": "b75820bd-378f-4961-806a-dd71c59d080c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "3b77816d-6cf0-406d-83a7-a42aff8a1343"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "02e0d18f-ce0a-46a7-ad98-1646baa923aa",
          "ObjectID": null,
          "ObjectID_Tosave": "ac00803d-d1d0-4a55-a794-48bb6ac59a64",
          "QueryName": "List_TABD_Attachments",
          "DisplayName": "List_TABD_Attachments",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "8d2d7e71-9002-4c4a-9b67-4b85ca0f9cd4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "2eafa523-5277-414f-84b4-dffe2b11f23c"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "66a60412-f88d-40ce-98a6-5021ce51a1b3",
          "ObjectID": null,
          "ObjectID_Tosave": "ac00803d-d1d0-4a55-a794-48bb6ac59a64",
          "QueryName": "FK_TABD_Attachments_MediaInfo",
          "DisplayName": "FK_TABD_Attachments_MediaInfo",
          "FilterLogic": null,
          "Fields": [],
          "Filters": {
            "Filters": [
              {
                "ID": "eea77969-9d73-4172-82c0-0eb458bcd452",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "ID",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "fff938a7-8eb0-4d28-b8ca-5205139828dd"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "6aa710f8-678a-4b16-acc0-628317da07de",
          "ObjectID": null,
          "ObjectID_Tosave": "ac00803d-d1d0-4a55-a794-48bb6ac59a64",
          "QueryName": "Default_TABD_Attachments",
          "DisplayName": "Default_TABD_Attachments",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "444bb87c-f005-45c8-a3fd-1f8ead33c456",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "2eafa523-5277-414f-84b4-dffe2b11f23c"
            },
            {
              "ID": "74e852be-2833-4380-ba50-202666d73a43",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9c59fe66-61a4-4961-9cad-fb76b1a56762"
            },
            {
              "ID": "98e09ff6-e8ce-4c3a-aa6d-203221aa99d7",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "82002cfc-e52b-4bd0-baa7-f5f594f5e19d"
            },
            {
              "ID": "482adda9-9b9a-4d33-925f-74db7350b925",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "52f30b19-cf0d-4f63-b4c0-9ffaa1003e57"
            },
            {
              "ID": "7023d028-8070-4c99-8d69-861d0a785b0a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "3b77816d-6cf0-406d-83a7-a42aff8a1343"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "1f803e99-4e56-4db6-98ab-bf36bf3a008f",
          "ObjectID": null,
          "ObjectID_Tosave": "ac00803d-d1d0-4a55-a794-48bb6ac59a64",
          "QueryName": "Detail_TABD_Attachments",
          "DisplayName": "Detail_TABD_Attachments",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "db0885fb-e279-47a4-a624-3295298cf266",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9c59fe66-61a4-4961-9cad-fb76b1a56762"
            },
            {
              "ID": "1c483948-dea8-422a-9a7e-6261121a807b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "52f30b19-cf0d-4f63-b4c0-9ffaa1003e57"
            },
            {
              "ID": "f6f453ac-20cd-4ca3-a356-9b9f109463d1",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "2eafa523-5277-414f-84b4-dffe2b11f23c"
            },
            {
              "ID": "e998fb1e-9bc1-49f0-9b30-9dc3c594f05e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "82002cfc-e52b-4bd0-baa7-f5f594f5e19d"
            },
            {
              "ID": "8d83c27a-7f2b-4a35-98a6-fa0851c54f1d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "3b77816d-6cf0-406d-83a7-a42aff8a1343"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "1be5f4c7-0e1d-4039-b971-dc2d0bcfca7d",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "2eafa523-5277-414f-84b4-dffe2b11f23c"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "3950dc42-ae7b-4e9a-95d2-e869d78ef616",
              "ParameterName": "Id",
              "DataSourceQueryID": "1f803e99-4e56-4db6-98ab-bf36bf3a008f",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "610c1842-6641-4182-b2dc-ec4295339ae3",
          "ObjectID": null,
          "ObjectID_Tosave": "ac00803d-d1d0-4a55-a794-48bb6ac59a64",
          "QueryName": "FK_TABD_Attachments_TABD_RecordInfo",
          "DisplayName": "FK_TABD_Attachments_TABD_RecordInfo",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "e0f6a544-eaf1-4abc-8a9f-03ca4426816e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "3b77816d-6cf0-406d-83a7-a42aff8a1343"
            },
            {
              "ID": "a807ef31-d50d-4620-8b74-88590d25f484",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "82002cfc-e52b-4bd0-baa7-f5f594f5e19d"
            },
            {
              "ID": "aa88e605-8f6a-46e3-9db6-8a0b568c6357",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "9c59fe66-61a4-4961-9cad-fb76b1a56762"
            },
            {
              "ID": "b4d1942f-91aa-4956-bde5-9f62e3c8d5b0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "2eafa523-5277-414f-84b4-dffe2b11f23c"
            },
            {
              "ID": "d021e53a-44ee-4531-85e7-d38b577c0154",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "52f30b19-cf0d-4f63-b4c0-9ffaa1003e57"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "9acafe3a-8e52-4623-8521-7b4bf08afb5b",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "82002cfc-e52b-4bd0-baa7-f5f594f5e19d"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "8ed10fbf-92c7-42cc-865e-2165922d288f",
              "ParameterName": "Id",
              "DataSourceQueryID": "610c1842-6641-4182-b2dc-ec4295339ae3",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "TABD_Attachments",
      "Resources": null,
      "IsSystem": true,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "ac00803d-d1d0-4a55-a794-48bb6ac59a64",
      "AppObjectConfiguration": null,
      "AllowVersioning": false,
      "IsSupportBluePrint": false,
      "IsLocationTracking": false,
      "AllowSoftDelete": false,
      "IsReplicationNeeded": false,
      "IsCacheEnable": false,
      "CacheTtl": 0,
      "ConnectionId": "0a08b86a-dd7b-4695-ada9-6d6dae85af59",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "905a3188-6e49-43ec-9c91-9a9077da6594",
        "UpdatedBy": "fc5ad49a-41d3-4f44-90fc-a7baf61c410e",
        "CreatedOn": "2024-06-25T12:17:43.617",
        "UpdatedOn": "2025-06-11T10:26:38",
        "IsSystemRecord": true,
        "AppId": null
      }
    },
    {
      "ID": "259ac852-5961-40c4-b020-2c5d7a3b4d93",
      "ObjectName": "TABD_UserPersonalization",
      "DisplayName": "TABD_UserPersonalization",
      "Description": "TABD_UserPersonalization",
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": false,
      "DeploymentStatus": 2,
      "Fields": [
        {
          "ID": "ab33c5c0-94a1-470f-b571-32f099963d0b",
          "ObjectID": null,
          "ObjectID_Tosave": "259ac852-5961-40c4-b020-2c5d7a3b4d93",
          "FieldName": "UserId",
          "DisplayName": "UserId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "UserId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "4261c3ae-bd96-49a2-9675-a27a6e828f08",
          "ObjectID": null,
          "ObjectID_Tosave": "259ac852-5961-40c4-b020-2c5d7a3b4d93",
          "FieldName": "ComponentId",
          "DisplayName": "ComponentId",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "ComponentId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": true,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": "{\"Validations\":[{}]}"
        },
        {
          "ID": "dc928809-0079-4b8f-b8a8-a62c4522e996",
          "ObjectID": null,
          "ObjectID_Tosave": "259ac852-5961-40c4-b020-2c5d7a3b4d93",
          "FieldName": "Key",
          "DisplayName": "Key",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Key",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "6ac89435-0902-425f-aa9e-b439caf31b51",
          "ObjectID": null,
          "ObjectID_Tosave": "259ac852-5961-40c4-b020-2c5d7a3b4d93",
          "FieldName": "ScreenId",
          "DisplayName": "ScreenId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "ScreenId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "d43926b5-9018-4c6c-b718-c5182c13e602",
          "ObjectID": null,
          "ObjectID_Tosave": "259ac852-5961-40c4-b020-2c5d7a3b4d93",
          "FieldName": "Config",
          "DisplayName": "Config",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Config",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "d2f4566a-50e2-4ab2-b7a7-dcd53fe0360b",
          "ObjectID": null,
          "ObjectID_Tosave": "259ac852-5961-40c4-b020-2c5d7a3b4d93",
          "FieldName": "Id",
          "DisplayName": "Id",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Id",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "3e918fa0-53f4-421e-849d-de0c0952b072",
          "ObjectID": null,
          "ObjectID_Tosave": "259ac852-5961-40c4-b020-2c5d7a3b4d93",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "259AC852-5961-40C4-B020-2C5D7A3B4D93",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "434ed67b-7e9d-4c8d-bdb6-e5b6ebaddabd",
          "ObjectID": null,
          "ObjectID_Tosave": "259ac852-5961-40c4-b020-2c5d7a3b4d93",
          "FieldName": "Type",
          "DisplayName": "Type",
          "FieldType": {
            "DataType": 2,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Type",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": null,
      "DataSourceQueries": [
        {
          "ID": "6e4be759-6d6c-4d4a-92e3-2d9737607c3f",
          "ObjectID": null,
          "ObjectID_Tosave": "259ac852-5961-40c4-b020-2c5d7a3b4d93",
          "QueryName": "DEV_TABD_UserPersonalization",
          "DisplayName": "DEV_TABD_UserPersonalization",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "a0d6f80b-81a0-4f92-8e7a-1a8289e39a5e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "dc928809-0079-4b8f-b8a8-a62c4522e996"
            },
            {
              "ID": "d0ca0198-6e5e-4e44-9aaf-89de09d22428",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ab33c5c0-94a1-470f-b571-32f099963d0b"
            },
            {
              "ID": "c0e9eb47-df5a-4cba-94d8-a62c4c929e13",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "3e918fa0-53f4-421e-849d-de0c0952b072"
            },
            {
              "ID": "c28d66f7-ce6e-4b68-a278-becac3c6326a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d2f4566a-50e2-4ab2-b7a7-dcd53fe0360b"
            },
            {
              "ID": "21f6f0fe-0f28-4072-9942-d82860a0e8a4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "4261c3ae-bd96-49a2-9675-a27a6e828f08"
            },
            {
              "ID": "eea255e7-5f7d-4074-9d61-ed64bf095fe4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d43926b5-9018-4c6c-b718-c5182c13e602"
            },
            {
              "ID": "0cd48059-6791-4a4f-ba1f-f013a94945d6",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "434ed67b-7e9d-4c8d-bdb6-e5b6ebaddabd"
            },
            {
              "ID": "1a16a322-0f4b-49c4-be68-feac81ca9595",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6ac89435-0902-425f-aa9e-b439caf31b51"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "3cc83421-800a-4b91-969e-5922ea460661",
          "ObjectID": null,
          "ObjectID_Tosave": "259ac852-5961-40c4-b020-2c5d7a3b4d93",
          "QueryName": "Default_TABD_UserPersonalization",
          "DisplayName": "Default_TABD_UserPersonalization",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "5b4efde6-c57f-4bb7-86dc-0115d955d360",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d2f4566a-50e2-4ab2-b7a7-dcd53fe0360b"
            },
            {
              "ID": "bd07b3c9-dcb0-489d-98b7-79da1cc9c7d7",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d43926b5-9018-4c6c-b718-c5182c13e602"
            },
            {
              "ID": "359adae1-f717-4e36-82ca-90fa16347ce6",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "4261c3ae-bd96-49a2-9675-a27a6e828f08"
            },
            {
              "ID": "3ac10fc1-5502-4a92-bc2a-94c082c3e91f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "3e918fa0-53f4-421e-849d-de0c0952b072"
            },
            {
              "ID": "25cae3dc-0734-4f6a-a0f5-ab42fcb88440",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ab33c5c0-94a1-470f-b571-32f099963d0b"
            },
            {
              "ID": "4d95c502-9a8b-4c7d-8167-bd060d7a496f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6ac89435-0902-425f-aa9e-b439caf31b51"
            },
            {
              "ID": "4ab2c65a-2437-4fec-a66b-f06fd7124389",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "434ed67b-7e9d-4c8d-bdb6-e5b6ebaddabd"
            },
            {
              "ID": "db8bdb17-421d-4195-b77d-fac9506ac84c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "dc928809-0079-4b8f-b8a8-a62c4522e996"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "9df4a8ae-8300-4161-b118-a8c1934901a6",
          "ObjectID": null,
          "ObjectID_Tosave": "259ac852-5961-40c4-b020-2c5d7a3b4d93",
          "QueryName": "Get_UserWise_Personalize_Data",
          "DisplayName": "Get_UserWise_Personalize_Data",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "2feec25f-6528-4ae6-8f50-05ec3610d1d2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "dc928809-0079-4b8f-b8a8-a62c4522e996"
            },
            {
              "ID": "922082ed-153e-4596-bb6f-07dded5c0951",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ab33c5c0-94a1-470f-b571-32f099963d0b"
            },
            {
              "ID": "39a9b77b-7735-4b72-b1e0-59ea96c7f2d8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6ac89435-0902-425f-aa9e-b439caf31b51"
            },
            {
              "ID": "0ca51ea2-d5ab-44e7-889a-7ba71b725173",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d2f4566a-50e2-4ab2-b7a7-dcd53fe0360b"
            },
            {
              "ID": "8c7985f3-01af-414e-bb58-878de8d9832e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.TenantId",
              "AppFieldID": "f9a5bee3-f20c-47db-bbd4-ac0d972985f5"
            },
            {
              "ID": "91b92bae-1d90-48b0-b23e-e575079f62d2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "4261c3ae-bd96-49a2-9675-a27a6e828f08"
            },
            {
              "ID": "917a4485-9bea-446c-941e-ee6c02b34aa2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "434ed67b-7e9d-4c8d-bdb6-e5b6ebaddabd"
            },
            {
              "ID": "0c24aa62-d8db-4bc8-abd1-f8cd9c2ccb30",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d43926b5-9018-4c6c-b718-c5182c13e602"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 2,
                "RelationalOperator": 3,
                "ValueType": 4,
                "value": "{{LOGGEDINUSER}}",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "ab33c5c0-94a1-470f-b571-32f099963d0b"
              },
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 2,
                "RelationalOperator": 6,
                "ValueType": 0,
                "value": "",
                "Sequence": 2,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "ab33c5c0-94a1-470f-b571-32f099963d0b"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "5002c887-6d7d-4117-b110-d36cdc307ddc",
          "ObjectID": null,
          "ObjectID_Tosave": "259ac852-5961-40c4-b020-2c5d7a3b4d93",
          "QueryName": "Get_UserPersonalize_Data",
          "DisplayName": "Get_UserPersonalize_Data",
          "FilterLogic": "[1 AND [2]]",
          "Fields": [
            {
              "ID": "c3e3abf7-0070-4dd9-ae99-04e205029ab3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ab33c5c0-94a1-470f-b571-32f099963d0b"
            },
            {
              "ID": "777d75c8-4127-45d0-b2cc-0efceb2f8f02",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "4261c3ae-bd96-49a2-9675-a27a6e828f08"
            },
            {
              "ID": "bd0b1ac8-22ec-46eb-a6ea-2835f61b56b8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d43926b5-9018-4c6c-b718-c5182c13e602"
            },
            {
              "ID": "814af307-0c07-4793-9cdd-49650b14f72e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6ac89435-0902-425f-aa9e-b439caf31b51"
            },
            {
              "ID": "c80d4212-2a5f-4788-99c1-5cea06da80c8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "434ed67b-7e9d-4c8d-bdb6-e5b6ebaddabd"
            },
            {
              "ID": "3525fc8b-01a1-470d-ba72-edf2a2d5a07c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "dc928809-0079-4b8f-b8a8-a62c4522e996"
            },
            {
              "ID": "9107daf4-1202-42d1-a266-ef86fb3ef4b2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d2f4566a-50e2-4ab2-b7a7-dcd53fe0360b"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "ComponentId",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "4261c3ae-bd96-49a2-9675-a27a6e828f08"
              },
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Key",
                "Sequence": 2,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "dc928809-0079-4b8f-b8a8-a62c4522e996"
              },
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Type",
                "Sequence": 3,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "434ed67b-7e9d-4c8d-bdb6-e5b6ebaddabd"
              },
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "ScreenId",
                "Sequence": 4,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "6ac89435-0902-425f-aa9e-b439caf31b51"
              },
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 2,
                "RelationalOperator": 6,
                "ValueType": 0,
                "value": "",
                "Sequence": 1,
                "GroupID": 2,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "ab33c5c0-94a1-470f-b571-32f099963d0b"
              },
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 2,
                "RelationalOperator": 3,
                "ValueType": 4,
                "value": "{{LOGGEDINUSER}}",
                "Sequence": 2,
                "GroupID": 2,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "ab33c5c0-94a1-470f-b571-32f099963d0b"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [
            {
              "ID": "caf974e0-fd78-4915-8e02-a9e871f05c98",
              "SortSequence": 2,
              "Sequence": 1,
              "LookupDetails": "UserId",
              "FieldType": 1,
              "AppFieldID": "ab33c5c0-94a1-470f-b571-32f099963d0b"
            }
          ],
          "Parameters": [
            {
              "ID": "d04a134a-33f6-452a-ba35-7b1f84efca5a",
              "ParameterName": "Key",
              "DataSourceQueryID": "5002c887-6d7d-4117-b110-d36cdc307ddc",
              "MappingFieldName": "Key",
              "IsMandatory": false
            },
            {
              "ID": "9df88cc5-4936-42d2-a89f-7e1d2e8b3665",
              "ParameterName": "ComponentId",
              "DataSourceQueryID": "5002c887-6d7d-4117-b110-d36cdc307ddc",
              "MappingFieldName": "ComponentId",
              "IsMandatory": true
            },
            {
              "ID": "eb544cc8-ee15-4154-8502-85b34ce6eb8b",
              "ParameterName": "Type",
              "DataSourceQueryID": "5002c887-6d7d-4117-b110-d36cdc307ddc",
              "MappingFieldName": "Type",
              "IsMandatory": true
            },
            {
              "ID": "852423b8-b59d-49bb-965b-a451a1cf62bc",
              "ParameterName": "ScreenId",
              "DataSourceQueryID": "5002c887-6d7d-4117-b110-d36cdc307ddc",
              "MappingFieldName": "ScreenId",
              "IsMandatory": true
            },
            {
              "ID": "a0b78a48-fad2-406e-84d9-e698ffbcaf27",
              "ParameterName": "UserId",
              "DataSourceQueryID": "5002c887-6d7d-4117-b110-d36cdc307ddc",
              "MappingFieldName": "UserId",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "be4c9157-2ab2-436e-8250-e015fbaef2cf",
          "ObjectID": null,
          "ObjectID_Tosave": "259ac852-5961-40c4-b020-2c5d7a3b4d93",
          "QueryName": "List_TABD_UserPersonalization",
          "DisplayName": "List_TABD_UserPersonalization",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "8c252325-be2c-4463-bc6f-9dee5c8d3b9e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d2f4566a-50e2-4ab2-b7a7-dcd53fe0360b"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "a8316cbd-e970-45c0-8d46-e0870738bc8d",
          "ObjectID": null,
          "ObjectID_Tosave": "259ac852-5961-40c4-b020-2c5d7a3b4d93",
          "QueryName": "Detail_TABD_UserPersonalization",
          "DisplayName": "Detail_TABD_UserPersonalization",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "57ee683b-9869-42d3-9ebe-12e7516051a5",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "434ed67b-7e9d-4c8d-bdb6-e5b6ebaddabd"
            },
            {
              "ID": "88d538a2-2124-472b-bca5-1fc3fef0dee6",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "3e918fa0-53f4-421e-849d-de0c0952b072"
            },
            {
              "ID": "85023aff-7fcd-4a87-8535-6e96f86cd77f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "4261c3ae-bd96-49a2-9675-a27a6e828f08"
            },
            {
              "ID": "ae1b448e-1b2d-457c-90c4-b5f7a100569a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d43926b5-9018-4c6c-b718-c5182c13e602"
            },
            {
              "ID": "8c7d9d08-e068-4feb-a304-be5b791b5f91",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ab33c5c0-94a1-470f-b571-32f099963d0b"
            },
            {
              "ID": "1b6117cc-0c34-4b10-9bf4-db5185ea0c8e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "dc928809-0079-4b8f-b8a8-a62c4522e996"
            },
            {
              "ID": "3d9a9a71-4908-4e58-811b-e0a38d152722",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d2f4566a-50e2-4ab2-b7a7-dcd53fe0360b"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "4de89c92-48e8-4e9b-ac68-cca8eefee722",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "d2f4566a-50e2-4ab2-b7a7-dcd53fe0360b"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "8c7715ed-87f2-4fa6-843b-6fe42539f9cb",
              "ParameterName": "Id",
              "DataSourceQueryID": "a8316cbd-e970-45c0-8d46-e0870738bc8d",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "TABD_UserPersonalization",
      "Resources": null,
      "IsSystem": true,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "259ac852-5961-40c4-b020-2c5d7a3b4d93",
      "AppObjectConfiguration": null,
      "AllowVersioning": true,
      "IsSupportBluePrint": false,
      "IsLocationTracking": false,
      "AllowSoftDelete": false,
      "IsReplicationNeeded": false,
      "IsCacheEnable": false,
      "CacheTtl": 0,
      "ConnectionId": "0a08b86a-dd7b-4695-ada9-6d6dae85af59",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "905a3188-6e49-43ec-9c91-9a9077da6594",
        "UpdatedBy": null,
        "CreatedOn": "2024-06-25T12:17:43.617",
        "UpdatedOn": null,
        "IsSystemRecord": true,
        "AppId": null
      }
    },
    {
      "ID": "b4e74f9d-5f9a-4600-994a-5432e587507d",
      "ObjectName": "TABD_WorkFlows",
      "DisplayName": "TABD_WorkFlows",
      "Description": "TABD_WorkFlows",
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": false,
      "DeploymentStatus": 2,
      "Fields": [
        {
          "ID": "c27b1265-9bf9-4025-ad0c-0398ee0c1e5c",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "FieldName": "CreatedBy",
          "DisplayName": "CreatedBy",
          "FieldType": {
            "DataType": 2,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "CreatedBy",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "dddc7cfe-0e1e-4dc9-a635-459fd16f019f",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "FieldName": "SyetemRequiredWorkFlow",
          "DisplayName": "SyetemRequiredWorkFlow",
          "FieldType": {
            "DataType": 2,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "SyetemRequiredWorkFlow",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "c2650e03-0d79-474b-80a7-466c98c14aa5",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "FieldName": "Id",
          "DisplayName": "Id",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Id",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "cf139b2b-7dda-499a-b205-514bab166556",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "FieldName": "AppObjectID",
          "DisplayName": "AppObjectID",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "AppObjectID",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "cfa889d0-54a9-437c-8f81-63ac28d250eb",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "FieldName": "WorkFlowName",
          "DisplayName": "WorkFlowName",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "WorkFlowName",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": true,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": "{\"Validations\":[{}]}"
        },
        {
          "ID": "edfcfacd-69c4-476e-89b5-71a4ec240048",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "FieldName": "CreatedOn",
          "DisplayName": "CreatedOn",
          "FieldType": {
            "DataType": 5,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "CreatedOn",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "0454089b-91c8-4183-ab8c-78d6d9a57c35",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "FieldName": "EvaluationCriteria",
          "DisplayName": "EvaluationCriteria",
          "FieldType": {
            "DataType": 2,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "EvaluationCriteria",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "b53665b4-afe0-4083-b311-91eafcbb1da1",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "FieldName": "Schema_Config",
          "DisplayName": "Schema_Config",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Schema_Config",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "b3a1d27c-064d-446a-b1f9-99d7c60a93d1",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "FieldName": "Description",
          "DisplayName": "Description",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Description",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "472c1ef8-d06c-49d4-9e42-af764e9edeca",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "FieldName": "Timings",
          "DisplayName": "Timings",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Timings",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "23ff3a3f-c7af-4d88-958f-e60fddac8a0c",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "B4E74F9D-5F9A-4600-994A-5432E587507D",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": null,
      "DataSourceQueries": [
        {
          "ID": "91702b60-72ce-4f0c-89aa-0f78e2ad5cb4",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "QueryName": "Default_TABD_WorkFlows",
          "DisplayName": "Default_TABD_WorkFlows",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "bab636a8-7795-4597-9034-2429e51321b9",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "23ff3a3f-c7af-4d88-958f-e60fddac8a0c"
            },
            {
              "ID": "5a118774-5201-4e10-b1b6-2c2aad3b96b3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "cf139b2b-7dda-499a-b205-514bab166556"
            },
            {
              "ID": "c6fe3ab6-ea1b-43f7-b6e4-3e40b0eef57e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "472c1ef8-d06c-49d4-9e42-af764e9edeca"
            },
            {
              "ID": "4a0fb4b9-ecfd-41d1-aa7c-51455e89214e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "cfa889d0-54a9-437c-8f81-63ac28d250eb"
            },
            {
              "ID": "6da74663-3dbc-4556-a4c4-55b342288098",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c2650e03-0d79-474b-80a7-466c98c14aa5"
            },
            {
              "ID": "6fa1d82c-998b-409c-8c5f-71a11bbdea76",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "edfcfacd-69c4-476e-89b5-71a4ec240048"
            },
            {
              "ID": "eefe13d0-5acd-4fec-b9d8-819360637940",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b3a1d27c-064d-446a-b1f9-99d7c60a93d1"
            },
            {
              "ID": "d23b37c7-f616-4aa8-832c-b37a59c6639b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b53665b4-afe0-4083-b311-91eafcbb1da1"
            },
            {
              "ID": "8bdc44b5-3ef8-4646-8e93-cab999e36ba5",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c27b1265-9bf9-4025-ad0c-0398ee0c1e5c"
            },
            {
              "ID": "cef40416-11b9-4232-a87e-d73e43953077",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "dddc7cfe-0e1e-4dc9-a635-459fd16f019f"
            },
            {
              "ID": "515112eb-071c-4718-84dd-e7e84dd614cd",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0454089b-91c8-4183-ab8c-78d6d9a57c35"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "073b12d5-cfc2-434a-a6af-279c5144ea8a",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "QueryName": "DEV_TABD_WorkFlows",
          "DisplayName": "DEV_TABD_WorkFlows",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "4fda5a07-c52a-4141-b1f6-20c3494525de",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "dddc7cfe-0e1e-4dc9-a635-459fd16f019f"
            },
            {
              "ID": "6a26994f-e87d-48ef-b8f8-346a88509d15",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0454089b-91c8-4183-ab8c-78d6d9a57c35"
            },
            {
              "ID": "0623808a-6686-4e81-b7bf-3ffe04826af3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c2650e03-0d79-474b-80a7-466c98c14aa5"
            },
            {
              "ID": "dec1ffff-aa7f-49ce-b7df-58f3d92e4288",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "cfa889d0-54a9-437c-8f81-63ac28d250eb"
            },
            {
              "ID": "9bfedca9-6610-4ef6-8167-5b89f0a52242",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b53665b4-afe0-4083-b311-91eafcbb1da1"
            },
            {
              "ID": "97850cd5-a481-4332-bc20-5c48eb430dbd",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "edfcfacd-69c4-476e-89b5-71a4ec240048"
            },
            {
              "ID": "4c24316d-de15-4f27-b439-a8fb056ade7a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c27b1265-9bf9-4025-ad0c-0398ee0c1e5c"
            },
            {
              "ID": "a0b46839-1507-4d88-b585-c6304e93593e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "cf139b2b-7dda-499a-b205-514bab166556"
            },
            {
              "ID": "dab287da-1a9e-4200-abbf-db4b64d18cdd",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "23ff3a3f-c7af-4d88-958f-e60fddac8a0c"
            },
            {
              "ID": "a4f39c44-d546-4087-849e-df9867125caa",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b3a1d27c-064d-446a-b1f9-99d7c60a93d1"
            },
            {
              "ID": "c8d79c95-76bf-40b2-b3b1-f0ca9b1a5f9b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "472c1ef8-d06c-49d4-9e42-af764e9edeca"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "e601cb36-97ed-412a-82fd-4333966ba801",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "QueryName": "Get_Workflow_Detail",
          "DisplayName": "Get_Workflow_Detail",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "b9a55f7a-f579-4aa4-9e96-05e160cc152c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b53665b4-afe0-4083-b311-91eafcbb1da1"
            },
            {
              "ID": "f4f4938a-c1c8-43e9-97f5-30896df7a55c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "cf139b2b-7dda-499a-b205-514bab166556"
            },
            {
              "ID": "7c00debf-e222-42bc-bea0-96da41ec90b3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "cfa889d0-54a9-437c-8f81-63ac28d250eb"
            },
            {
              "ID": "5494acc1-5d90-4c70-ab3a-999003abe21a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "edfcfacd-69c4-476e-89b5-71a4ec240048"
            },
            {
              "ID": "4e9dadf6-194b-4a4f-82d1-a53355330ab9",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c2650e03-0d79-474b-80a7-466c98c14aa5"
            },
            {
              "ID": "b37bbe03-203c-4500-a42e-f9c3dcae2f84",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b3a1d27c-064d-446a-b1f9-99d7c60a93d1"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "c2650e03-0d79-474b-80a7-466c98c14aa5"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "e6dee1fd-ffe7-4eef-bb5d-c2113dae58eb",
              "ParameterName": "Id",
              "DataSourceQueryID": "e601cb36-97ed-412a-82fd-4333966ba801",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "bd26506f-d7e9-46d3-8e8c-64bff6d79026",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "QueryName": "Get_Workflow_RecordInfo",
          "DisplayName": "Get_Workflow_RecordInfo",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "3d5d2fa4-99d8-4e48-a410-0185bc1cd73a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.IsSystemRecord",
              "AppFieldID": "7c3e041e-6086-48f0-9ba8-61da0e241b29"
            },
            {
              "ID": "790917c0-8bb1-4ca1-b045-0851f33e235a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c2650e03-0d79-474b-80a7-466c98c14aa5"
            },
            {
              "ID": "432b7c6f-b65b-4879-a149-0e19930916d9",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.OwnerLastName",
              "AppFieldID": "be0d04e9-0ce8-429d-af97-6119d799e108"
            },
            {
              "ID": "df6e2162-420a-4e2c-991b-123f70ac7f10",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.CreatedOn",
              "AppFieldID": "985391df-21b5-414d-9ebb-07e95ae448ba"
            },
            {
              "ID": "4576cb66-1dd1-4c05-9822-2bd4128b535a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.IsActive",
              "AppFieldID": "7fede379-4b82-4ba6-ac6c-da9c5bd3db9b"
            },
            {
              "ID": "b4729a82-a056-4ede-a9aa-32a400729953",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.UpdatedByLastName",
              "AppFieldID": "69727469-ed5e-48e0-b52a-874f430810bd"
            },
            {
              "ID": "cb296059-6a58-44ea-90be-42d502b29170",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.Title",
              "AppFieldID": "f9b2d96f-8a99-4927-b590-3fd4af2af318"
            },
            {
              "ID": "db6b0dde-5e61-4cf2-8af6-4bb741a7d571",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.UpdatedByFirstName",
              "AppFieldID": "5b5a0372-b741-4d2c-a319-f62950d07325"
            },
            {
              "ID": "729280a6-8324-47a5-965a-5bb0e0f5c180",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.AppObjectID",
              "AppFieldID": "497cbcb0-e5eb-4fcd-84d3-bebc4348069e"
            },
            {
              "ID": "1fb37486-f38b-4131-978f-65562b0f41fb",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.CreatedByLastName",
              "AppFieldID": "4447d5d5-552b-4e65-96b1-a6701e6efc02"
            },
            {
              "ID": "f32e73c6-9839-404a-89df-6b149391616b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.CreatedByFirstName",
              "AppFieldID": "bfac404a-c645-4472-a183-cfa4510346fd"
            },
            {
              "ID": "475a9ea1-3f25-46c2-8fb4-7452d0f11564",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "cfa889d0-54a9-437c-8f81-63ac28d250eb"
            },
            {
              "ID": "897facde-22aa-495d-bb50-779317e09a05",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.OwnerFirstName",
              "AppFieldID": "641b8455-61fe-4196-b231-c9acbdbb9513"
            },
            {
              "ID": "aa6dca4e-9dc5-4421-b38e-7e22cc602a1e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.PrimaryKey",
              "AppFieldID": "1765e7e6-c1f1-454d-abcf-2584ed643720"
            },
            {
              "ID": "584690ce-e506-49e9-85fb-977626c7f710",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.UpdatedOn",
              "AppFieldID": "ebcf22cb-9e6e-49cf-a069-5b2af3dc7ea3"
            },
            {
              "ID": "8591f7f1-dc39-4ef8-8e13-ccda4a112d8e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.RecordId",
              "AppFieldID": "d3661c2c-e872-4f5a-9030-4c8f97c704c5"
            },
            {
              "ID": "f9cf7cd4-3d0f-4212-ad40-f321f4220a86",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.Tags",
              "AppFieldID": "c73fb52f-ef29-4229-9f07-df27b6ab3d22"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "c2650e03-0d79-474b-80a7-466c98c14aa5"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "494d110b-1365-45cd-bb48-8fa1bf809d12",
              "ParameterName": "Id",
              "DataSourceQueryID": "bd26506f-d7e9-46d3-8e8c-64bff6d79026",
              "MappingFieldName": "Id",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "1c88fbd9-5138-483f-85a4-8099a2ebc0d2",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "QueryName": "Detail_TABD_WorkFlows",
          "DisplayName": "Detail_TABD_WorkFlows",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "0ea7740b-10a1-4e9e-918a-141701faa51d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b3a1d27c-064d-446a-b1f9-99d7c60a93d1"
            },
            {
              "ID": "a4310a31-8c4d-4023-af36-1c220bdb9d3a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c2650e03-0d79-474b-80a7-466c98c14aa5"
            },
            {
              "ID": "2c04b94e-1e4f-4c76-971a-22bf23fc883d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "cf139b2b-7dda-499a-b205-514bab166556"
            },
            {
              "ID": "d7130f67-966a-4c39-a82a-2357b9283b4d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c27b1265-9bf9-4025-ad0c-0398ee0c1e5c"
            },
            {
              "ID": "a4b08306-a6a6-463c-97c7-33c9171193cc",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "dddc7cfe-0e1e-4dc9-a635-459fd16f019f"
            },
            {
              "ID": "e0b3f9c3-6f46-4fcd-a31a-51149c5a606c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "b53665b4-afe0-4083-b311-91eafcbb1da1"
            },
            {
              "ID": "c1f99aa1-6030-421a-bcef-93b628972464",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "23ff3a3f-c7af-4d88-958f-e60fddac8a0c"
            },
            {
              "ID": "8d7c7ba1-8cb3-46e7-a8f5-de7dab4012c7",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "0454089b-91c8-4183-ab8c-78d6d9a57c35"
            },
            {
              "ID": "e787f5bd-166e-456d-99c0-e7e1b3c63f81",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "472c1ef8-d06c-49d4-9e42-af764e9edeca"
            },
            {
              "ID": "5215154b-04d1-464a-9ded-f01d26f276ad",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "edfcfacd-69c4-476e-89b5-71a4ec240048"
            },
            {
              "ID": "f8f3fdfe-153d-4a6c-a75e-f1fec1f266e0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "cfa889d0-54a9-437c-8f81-63ac28d250eb"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "38786d89-e261-4dd2-a183-0d638566681f",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "c2650e03-0d79-474b-80a7-466c98c14aa5"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "a262b048-1d9e-46a2-9aeb-3ab09a99bab4",
              "ParameterName": "Id",
              "DataSourceQueryID": "1c88fbd9-5138-483f-85a4-8099a2ebc0d2",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "1f9e38ef-2e00-49cc-8c67-926944924120",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "QueryName": "List_TABD_WorkFlows",
          "DisplayName": "List_TABD_WorkFlows",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "c17ce03d-f25d-471b-9b2a-16fb83cf0d97",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c2650e03-0d79-474b-80a7-466c98c14aa5"
            },
            {
              "ID": "df5f7ad8-35d4-43c9-8ec5-3608df3b54a2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "cfa889d0-54a9-437c-8f81-63ac28d250eb"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "33112f65-43f9-4d9d-9edf-f0765b19e67b",
          "ObjectID": null,
          "ObjectID_Tosave": "b4e74f9d-5f9a-4600-994a-5432e587507d",
          "QueryName": "Test_Sync_App_field",
          "DisplayName": "Test_Sync_App_field",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "dd88b693-256a-4b3e-995a-2ad38d459a2d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c2650e03-0d79-474b-80a7-466c98c14aa5"
            },
            {
              "ID": "1ac841da-c1e5-4378-aa59-5c473d5b09b5",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "472c1ef8-d06c-49d4-9e42-af764e9edeca"
            },
            {
              "ID": "3ff33c38-db49-4e5f-bd51-648a572bb9f8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "cf139b2b-7dda-499a-b205-514bab166556"
            },
            {
              "ID": "df10fea8-8e24-4bdf-a7db-cc6e5fc20a65",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "cfa889d0-54a9-437c-8f81-63ac28d250eb"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "AppObjectId",
                "Sequence": 2,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "cf139b2b-7dda-499a-b205-514bab166556"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "3f586bb9-d0ca-42aa-a9c2-5d47f784a445",
              "ParameterName": "AppObjectId",
              "DataSourceQueryID": "33112f65-43f9-4d9d-9edf-f0765b19e67b",
              "MappingFieldName": "AppObjectId",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "TABD_WorkFlows",
      "Resources": null,
      "IsSystem": true,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "b4e74f9d-5f9a-4600-994a-5432e587507d",
      "AppObjectConfiguration": "{\n  \"RecordInfoTitleConfiguration\": \"{{WorkFlowName}}\"\n  }",
      "AllowVersioning": true,
      "IsSupportBluePrint": false,
      "IsLocationTracking": false,
      "AllowSoftDelete": false,
      "IsReplicationNeeded": false,
      "IsCacheEnable": false,
      "CacheTtl": 0,
      "ConnectionId": "0a08b86a-dd7b-4695-ada9-6d6dae85af59",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "905a3188-6e49-43ec-9c91-9a9077da6594",
        "UpdatedBy": null,
        "CreatedOn": "2024-06-25T12:17:43.617",
        "UpdatedOn": null,
        "IsSystemRecord": true,
        "AppId": null
      }
    },
    {
      "ID": "ea02d1bb-162c-4700-829d-a59c309355c6",
      "ObjectName": "TABD_Team",
      "DisplayName": "TABD_Team",
      "Description": "TABD_Team",
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": false,
      "DeploymentStatus": 2,
      "Fields": [
        {
          "ID": "157faff9-8800-4275-9747-375bea3110ac",
          "ObjectID": null,
          "ObjectID_Tosave": "ea02d1bb-162c-4700-829d-a59c309355c6",
          "FieldName": "Id",
          "DisplayName": "Id",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Id",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "370c9b94-6b18-4ca7-812d-b0607f7af776",
          "ObjectID": null,
          "ObjectID_Tosave": "ea02d1bb-162c-4700-829d-a59c309355c6",
          "FieldName": "Description",
          "DisplayName": "Description",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Description",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "86070cea-1938-471b-84f0-c60034414a88",
          "ObjectID": null,
          "ObjectID_Tosave": "ea02d1bb-162c-4700-829d-a59c309355c6",
          "FieldName": "TeamName",
          "DisplayName": "Team Name",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "TeamName",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "6f570210-f962-43f8-819f-d48528d53387",
          "ObjectID": null,
          "ObjectID_Tosave": "ea02d1bb-162c-4700-829d-a59c309355c6",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "EA02D1BB-162C-4700-829D-A59C309355C6",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": [
        {
          "childDetails": {
            "LookupObject": "TABD_Team_Users",
            "LookupField": "TeamID",
            "DisplayField": "",
            "selectQuery": null
          },
          "LocalId": "Id"
        }
      ],
      "DataSourceQueries": [
        {
          "ID": "7e1c674a-5cd2-4d5e-9a19-1532a7095570",
          "ObjectID": null,
          "ObjectID_Tosave": "ea02d1bb-162c-4700-829d-a59c309355c6",
          "QueryName": "Default_TABD_Team",
          "DisplayName": "Default_TABD_Team",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "f6ccdaca-5d32-4cc8-aaf8-518693994e04",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6f570210-f962-43f8-819f-d48528d53387"
            },
            {
              "ID": "e9e9ab94-e19e-4e05-b3fd-d00db9b95ee2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "370c9b94-6b18-4ca7-812d-b0607f7af776"
            },
            {
              "ID": "7dd8288d-03e6-4f03-be73-fb8c7d7048ea",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "86070cea-1938-471b-84f0-c60034414a88"
            },
            {
              "ID": "38d0f4a6-4c37-43c1-b52b-fe94bb1a17b1",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "157faff9-8800-4275-9747-375bea3110ac"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "4d5a41df-c920-40a4-b9a9-3af5fe48da83",
          "ObjectID": null,
          "ObjectID_Tosave": "ea02d1bb-162c-4700-829d-a59c309355c6",
          "QueryName": "DEV_TABD_Team",
          "DisplayName": "DEV_TABD_Team",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "423c30ec-f193-4165-b992-00dee7e79cb4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "157faff9-8800-4275-9747-375bea3110ac"
            },
            {
              "ID": "b0448e63-2be6-4093-bade-1405dc512323",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "86070cea-1938-471b-84f0-c60034414a88"
            },
            {
              "ID": "a8653fc8-c6f8-4ac3-b13f-7e0f3a41d6c7",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6f570210-f962-43f8-819f-d48528d53387"
            },
            {
              "ID": "07b175c5-41ed-421f-97b3-cdaed8546288",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "370c9b94-6b18-4ca7-812d-b0607f7af776"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "f70a6abf-6be2-4bce-a167-5a710115b570",
          "ObjectID": null,
          "ObjectID_Tosave": "ea02d1bb-162c-4700-829d-a59c309355c6",
          "QueryName": "List_TABD_Team",
          "DisplayName": "List_TABD_Team",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "65cee0c3-83cc-4ecc-8699-29d92a81a7a4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "157faff9-8800-4275-9747-375bea3110ac"
            },
            {
              "ID": "2b7f69c8-3d23-4231-9da0-f5fa13ab1ece",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "86070cea-1938-471b-84f0-c60034414a88"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "cd776368-7987-4a4e-ae32-8c01bb44a4c1",
          "ObjectID": null,
          "ObjectID_Tosave": "ea02d1bb-162c-4700-829d-a59c309355c6",
          "QueryName": "TeamWise_Members",
          "DisplayName": "TeamWise_Members",
          "FilterLogic": "1",
          "Fields": [
            {
              "ID": "704cc6b4-20c9-4d68-8726-0ab2751a6856",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 6,
              "FieldDetails": "#TABD_Team_Users:Get_List_Team_UserId",
              "AppFieldID": "6373e7ea-4d92-4966-817a-6a966d5ecbb2"
            },
            {
              "ID": "02897557-7872-4ae7-a28c-7ad4cd4a2e81",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "86070cea-1938-471b-84f0-c60034414a88"
            },
            {
              "ID": "36dc4935-5b80-424f-ae77-d1cc33c9c3a9",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "157faff9-8800-4275-9747-375bea3110ac"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "00000000-0000-0000-0000-000000000000",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "157faff9-8800-4275-9747-375bea3110ac"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "2d98f7a6-2b69-402b-9831-69d7a775b243",
              "ParameterName": "Id",
              "DataSourceQueryID": "cd776368-7987-4a4e-ae32-8c01bb44a4c1",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "35b3b2cd-77c8-41bf-b764-c2f49beb4beb",
          "ObjectID": null,
          "ObjectID_Tosave": "ea02d1bb-162c-4700-829d-a59c309355c6",
          "QueryName": "Detail_TABD_Team_ByName",
          "DisplayName": "Detail_TABD_Team_ByName",
          "FilterLogic": null,
          "Fields": [],
          "Filters": {
            "Filters": [
              {
                "ID": "93e323ff-2ff9-4a3a-9fe3-e80fb9dc8aad",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Name",
                "Sequence": 0,
                "GroupID": 2,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "32747e65-97c4-41b8-b4d9-5de4373dfe34"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "58264616-ac7a-423c-846d-fa708d0a5ebc",
          "ObjectID": null,
          "ObjectID_Tosave": "ea02d1bb-162c-4700-829d-a59c309355c6",
          "QueryName": "Detail_TABD_Team",
          "DisplayName": "Detail_TABD_Team",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "f1305214-26b9-4b74-bf54-0b6c12d4a40d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "157faff9-8800-4275-9747-375bea3110ac"
            },
            {
              "ID": "ddf48d0b-1ada-4a68-a8f6-2c175a0b76c4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 6,
              "FieldDetails": "#TABD_Team_Users:Get_List_Team_UserId",
              "AppFieldID": "4c202d77-da9e-4b77-9d54-12ca26586138"
            },
            {
              "ID": "a8cdab50-8048-4389-9067-33f5bcfbad50",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6f570210-f962-43f8-819f-d48528d53387"
            },
            {
              "ID": "edf0f876-9b95-4cfc-8371-9ba4720a1fe7",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "370c9b94-6b18-4ca7-812d-b0607f7af776"
            },
            {
              "ID": "c1f98965-f128-4a85-91ca-b9539650f1cf",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "86070cea-1938-471b-84f0-c60034414a88"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "9bca72d1-cc8f-402a-bbbf-f624809a8b86",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "Id",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "157faff9-8800-4275-9747-375bea3110ac"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "c5b55a6d-a896-43a4-8321-c37548a63f46",
              "ParameterName": "Id",
              "DataSourceQueryID": "58264616-ac7a-423c-846d-fa708d0a5ebc",
              "MappingFieldName": "Id",
              "IsMandatory": false
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "TABD_Team",
      "Resources": null,
      "IsSystem": true,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "ea02d1bb-162c-4700-829d-a59c309355c6",
      "AppObjectConfiguration": null,
      "AllowVersioning": false,
      "IsSupportBluePrint": false,
      "IsLocationTracking": false,
      "AllowSoftDelete": false,
      "IsReplicationNeeded": false,
      "IsCacheEnable": false,
      "CacheTtl": 0,
      "ConnectionId": "0a08b86a-dd7b-4695-ada9-6d6dae85af59",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "905a3188-6e49-43ec-9c91-9a9077da6594",
        "UpdatedBy": "d052a189-a33f-4acd-8012-f66f9cc07cd3",
        "CreatedOn": "2024-06-25T12:17:43.617",
        "UpdatedOn": "2025-04-01T10:45:32",
        "IsSystemRecord": true,
        "AppId": null
      }
    },
    {
      "ID": "8c334990-19ad-49f7-bd35-a6b32da20360",
      "ObjectName": "TABD_Triggers",
      "DisplayName": "TABD_Triggers",
      "Description": null,
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": true,
      "DeploymentStatus": 1,
      "Fields": [
        {
          "ID": "3fbca3e8-5fda-426c-9c1b-0a404dec963c",
          "ObjectID": null,
          "ObjectID_Tosave": "8c334990-19ad-49f7-bd35-a6b32da20360",
          "FieldName": "SchedulerCRON",
          "DisplayName": "SchedulerCRON",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "SchedulerCRON",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "e552a796-bf09-436a-9d9c-0b2138096ac0",
          "ObjectID": null,
          "ObjectID_Tosave": "8c334990-19ad-49f7-bd35-a6b32da20360",
          "FieldName": "TriggerType",
          "DisplayName": "TriggerType",
          "FieldType": {
            "DataType": 2,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "TriggerType",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_SystemEnumDetails",
            "LookupField": "EnumDetailId",
            "DisplayField": "DisplayValue",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_SystemEnumDetails",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "efca5b11-fcaf-dc2b-500f-72133becfd63",
                    "ConjuctionClause": 1,
                    "FieldID": "bf4df312-0fbb-4c74-b08b-569728a16633",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "55b7d3dd-3413-40ee-b26e-c2dc2f905d67",
                    "Sequence": 1,
                    "GroupID": 1,
                    "FieldType": 2,
                    "LookUpDetail": "EnumID.Id"
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "4b7e6ffe-7af2-4cce-a2e2-1beab933174e",
          "ObjectID": null,
          "ObjectID_Tosave": "8c334990-19ad-49f7-bd35-a6b32da20360",
          "FieldName": "TriggerEvent",
          "DisplayName": "TriggerEvent",
          "FieldType": {
            "DataType": 2,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "TriggerEvent",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_SystemEnumDetails",
            "LookupField": "EnumDetailId",
            "DisplayField": "DisplayValue",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_SystemEnumDetails",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "4d99a362-ceb3-f9c2-5035-55f69286101d",
                    "ConjuctionClause": 1,
                    "FieldID": "bf4df312-0fbb-4c74-b08b-569728a16633",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "68612a6d-555f-40bb-839b-1196f34f5209",
                    "Sequence": 1,
                    "GroupID": 1,
                    "FieldType": 2,
                    "LookUpDetail": "EnumID.Id"
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "d76e356d-3bcb-4d55-8cf1-2a670fa8acee",
          "ObjectID": null,
          "ObjectID_Tosave": "8c334990-19ad-49f7-bd35-a6b32da20360",
          "FieldName": "AppObjectId",
          "DisplayName": "AppObjectId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "AppObjectId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABMD_AppObject",
            "LookupField": "Id",
            "DisplayField": "Id",
            "selectQuery": null
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "fb2ae4ea-1897-4e9a-83d6-313dc0d66694",
          "ObjectID": null,
          "ObjectID_Tosave": "8c334990-19ad-49f7-bd35-a6b32da20360",
          "FieldName": "EventExecutionDetails",
          "DisplayName": "EventExecutionDetails",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "EventExecutionDetails",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "e3a14029-2a51-48c2-b3c9-42ab5d9f5d06",
          "ObjectID": null,
          "ObjectID_Tosave": "8c334990-19ad-49f7-bd35-a6b32da20360",
          "FieldName": "TriggerOccurrence",
          "DisplayName": "TriggerOccurrence",
          "FieldType": {
            "DataType": 2,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "TriggerOccurrence",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_SystemEnumDetails",
            "LookupField": "EnumDetailId",
            "DisplayField": "DisplayValue",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_SystemEnumDetails",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "c5e29443-510e-691b-6eda-7c1ec944629f",
                    "ConjuctionClause": 1,
                    "FieldID": "bf4df312-0fbb-4c74-b08b-569728a16633",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "faaf8161-7b2c-4867-9b89-f04b7078aef7",
                    "Sequence": 1,
                    "GroupID": 1,
                    "FieldType": 2,
                    "LookUpDetail": "EnumID.Id"
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": "{\"Validations\":[{}]}"
        },
        {
          "ID": "8952c22a-bca2-4c15-9d10-54cd58ec0012",
          "ObjectID": null,
          "ObjectID_Tosave": "8c334990-19ad-49f7-bd35-a6b32da20360",
          "FieldName": "Name",
          "DisplayName": "Name",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Name",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "fd673eb1-f9d5-4ab3-bb18-6ecaae3ac7fc",
          "ObjectID": null,
          "ObjectID_Tosave": "8c334990-19ad-49f7-bd35-a6b32da20360",
          "FieldName": "Description",
          "DisplayName": "Description",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Description",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "328f7d74-8f77-4393-aece-7752f64757f6",
          "ObjectID": null,
          "ObjectID_Tosave": "8c334990-19ad-49f7-bd35-a6b32da20360",
          "FieldName": "Id",
          "DisplayName": "Id",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Id",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": true,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "6cce138e-a4d0-4e5f-b122-81576d42b8bd",
          "ObjectID": null,
          "ObjectID_Tosave": "8c334990-19ad-49f7-bd35-a6b32da20360",
          "FieldName": "TriggerFieldCriteria",
          "DisplayName": "TriggerFieldCriteria",
          "FieldType": {
            "DataType": 2,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "TriggerFieldCriteria",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "88f17dd2-3af9-456b-9610-93f69006b068",
          "ObjectID": null,
          "ObjectID_Tosave": "8c334990-19ad-49f7-bd35-a6b32da20360",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "8c334990-19ad-49f7-bd35-a6b32da20360",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "8a350bf0-c1a7-4f72-be3a-9a724fb9b2c8",
          "ObjectID": null,
          "ObjectID_Tosave": "8c334990-19ad-49f7-bd35-a6b32da20360",
          "FieldName": "FilterCriteria",
          "DisplayName": "FilterCriteria",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "FilterCriteria",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": null,
      "DataSourceQueries": [
        {
          "ID": "74c43820-3fcb-4c01-a8c3-3696392577fe",
          "ObjectID": null,
          "ObjectID_Tosave": "8c334990-19ad-49f7-bd35-a6b32da20360",
          "QueryName": "Default_TABD_Triggers",
          "DisplayName": "Default_TABD_Triggers",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "4f97e362-6bdb-4e34-8568-2cd138e0ba9a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fd673eb1-f9d5-4ab3-bb18-6ecaae3ac7fc"
            },
            {
              "ID": "06d9cf88-f79b-4cf6-ab87-31b6fc00e562",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e3a14029-2a51-48c2-b3c9-42ab5d9f5d06"
            },
            {
              "ID": "05e0c6c0-33e3-40b7-803d-331d588ce15e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "328f7d74-8f77-4393-aece-7752f64757f6"
            },
            {
              "ID": "0562488f-e99f-4a75-b725-36082b47ede2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6cce138e-a4d0-4e5f-b122-81576d42b8bd"
            },
            {
              "ID": "7725d38d-c41f-4ea5-b5f4-6bda54f4a0b1",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fb2ae4ea-1897-4e9a-83d6-313dc0d66694"
            },
            {
              "ID": "1244f70e-0d60-400a-a876-9c89a42c4075",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "3fbca3e8-5fda-426c-9c1b-0a404dec963c"
            },
            {
              "ID": "f0294354-4a20-4c37-b90f-9e44c0fd50eb",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8a350bf0-c1a7-4f72-be3a-9a724fb9b2c8"
            },
            {
              "ID": "be230cb9-2e61-49a1-9f84-c2dd49d4550e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e552a796-bf09-436a-9d9c-0b2138096ac0"
            },
            {
              "ID": "1e6c8715-f427-42f4-a3e9-d1d207c22732",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d76e356d-3bcb-4d55-8cf1-2a670fa8acee"
            },
            {
              "ID": "2fef6c21-4086-448e-b329-d21b88269e48",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8952c22a-bca2-4c15-9d10-54cd58ec0012"
            },
            {
              "ID": "e1370423-d611-445b-bc94-d83a91eecb19",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "4b7e6ffe-7af2-4cce-a2e2-1beab933174e"
            },
            {
              "ID": "c2389916-a04a-4068-b563-f2a8bab46b40",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "88f17dd2-3af9-456b-9610-93f69006b068"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "b49b5b90-3ea8-4fff-bee1-3e66e1344eb7",
          "ObjectID": null,
          "ObjectID_Tosave": "8c334990-19ad-49f7-bd35-a6b32da20360",
          "QueryName": "TABD_Triggers_List",
          "DisplayName": "TABD_Triggers_List",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "bdb12014-ff37-45b3-b4a7-0a61407cbe62",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6cce138e-a4d0-4e5f-b122-81576d42b8bd"
            },
            {
              "ID": "4bcd72db-9255-45d5-a3ad-0e3e8e693098",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "TriggerEvent.Id",
              "AppFieldID": "e6a1af0e-03d1-4c24-8de0-91f709cafd30"
            },
            {
              "ID": "071dd0db-b138-4834-afd2-191c991b945f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "TriggerType.EnumID",
              "AppFieldID": "8cf06da4-2edb-4af8-a02e-1a61ba1447c5"
            },
            {
              "ID": "ed84a2f6-9ed1-4284-8f57-2174d7c72167",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "TriggerOccurrence.EnumID",
              "AppFieldID": "8cf06da4-2edb-4af8-a02e-1a61ba1447c5"
            },
            {
              "ID": "0fb65387-72f3-4517-8e36-3954f7faf5e9",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "TriggerOccurrence.EnumDetailId",
              "AppFieldID": "d6e86c4c-2560-437a-8879-3c42e82a3645"
            },
            {
              "ID": "90b3d8a8-03c6-4498-ac9e-3e612ae26b3f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "3fbca3e8-5fda-426c-9c1b-0a404dec963c"
            },
            {
              "ID": "42d8dc1b-5817-41a8-a749-4a7259b30716",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "TriggerType.Id",
              "AppFieldID": "e6a1af0e-03d1-4c24-8de0-91f709cafd30"
            },
            {
              "ID": "93e5a4f6-1bb1-4e7c-b5bb-4f7b04a5365a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "TriggerType.EnumDetailId",
              "AppFieldID": "d6e86c4c-2560-437a-8879-3c42e82a3645"
            },
            {
              "ID": "bc2e536f-1edd-4207-90b3-6f3cc2be1275",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "TriggerEvent.DisplayValue",
              "AppFieldID": "ae62e479-3a52-4d14-9401-42d79417d60e"
            },
            {
              "ID": "79bfb4e6-efb0-430b-bedc-6f4761b27015",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fd673eb1-f9d5-4ab3-bb18-6ecaae3ac7fc"
            },
            {
              "ID": "c145e2eb-fd6e-4fd7-a90b-6fc494cfc103",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "TriggerEvent.EnumID",
              "AppFieldID": "8cf06da4-2edb-4af8-a02e-1a61ba1447c5"
            },
            {
              "ID": "58ec49fb-f51c-4952-b09e-78aab34a9da1",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "TriggerType.DisplayValue",
              "AppFieldID": "ae62e479-3a52-4d14-9401-42d79417d60e"
            },
            {
              "ID": "51ad5689-d73c-4b88-95ac-83f6444d6e46",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "TriggerOccurrence.Id",
              "AppFieldID": "e6a1af0e-03d1-4c24-8de0-91f709cafd30"
            },
            {
              "ID": "e1a4f7e3-e63f-42ab-8695-dd108265e83b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fb2ae4ea-1897-4e9a-83d6-313dc0d66694"
            },
            {
              "ID": "ce54a475-3b2c-4324-a0c8-e7523e3a2703",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "328f7d74-8f77-4393-aece-7752f64757f6"
            },
            {
              "ID": "414d0f03-229f-45ae-9770-ead417da6fe2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "TriggerOccurrence.DisplayValue",
              "AppFieldID": "ae62e479-3a52-4d14-9401-42d79417d60e"
            },
            {
              "ID": "1e1c0f4e-616d-4c53-8350-f53103d3e15d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8952c22a-bca2-4c15-9d10-54cd58ec0012"
            },
            {
              "ID": "06a7c125-cc36-4b4e-9759-fcf68a3522cd",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "TriggerEvent.EnumDetailId",
              "AppFieldID": "d6e86c4c-2560-437a-8879-3c42e82a3645"
            },
            {
              "ID": "426ab15d-86b7-4516-a0a0-fddd4dfb7817",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8a350bf0-c1a7-4f72-be3a-9a724fb9b2c8"
            },
            {
              "ID": "4787fd8d-f9e4-46ef-8ca1-fea20c2c62bf",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.RecordId",
              "AppFieldID": "d3661c2c-e872-4f5a-9030-4c8f97c704c5"
            },
            {
              "ID": "e7411d46-208b-4fbe-86af-ff3c591780dc",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.IsActive",
              "AppFieldID": "7fede379-4b82-4ba6-ac6c-da9c5bd3db9b"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "6b41c159-e5dd-4d15-8a51-464e99d46431",
          "ObjectID": null,
          "ObjectID_Tosave": "8c334990-19ad-49f7-bd35-a6b32da20360",
          "QueryName": "List_TABD_Triggers",
          "DisplayName": "List_TABD_Triggers",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "c0787aec-13bb-40f5-8a71-8a8bcaed917d",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8952c22a-bca2-4c15-9d10-54cd58ec0012"
            },
            {
              "ID": "479647d3-c4df-4f00-bd7f-cd2fc4354496",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "328f7d74-8f77-4393-aece-7752f64757f6"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "a002711f-c251-4e45-86b9-6669c52c9d4c",
          "ObjectID": null,
          "ObjectID_Tosave": "8c334990-19ad-49f7-bd35-a6b32da20360",
          "QueryName": "DEV_TABD_Triggers",
          "DisplayName": "DEV_TABD_Triggers",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "128bf710-8f76-48bd-9815-0e6de1b5cfd1",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8a350bf0-c1a7-4f72-be3a-9a724fb9b2c8"
            },
            {
              "ID": "cc0b74a9-8360-4231-96c3-30d71fe1a320",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "3fbca3e8-5fda-426c-9c1b-0a404dec963c"
            },
            {
              "ID": "4532bd8d-8ed9-44ac-a017-3744189c9552",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fd673eb1-f9d5-4ab3-bb18-6ecaae3ac7fc"
            },
            {
              "ID": "597edd60-93db-446d-a204-47bb8925fad5",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d76e356d-3bcb-4d55-8cf1-2a670fa8acee"
            },
            {
              "ID": "dec31914-ead4-4b7d-95b7-58eb5932068b",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6cce138e-a4d0-4e5f-b122-81576d42b8bd"
            },
            {
              "ID": "83757de5-bcd9-407c-939a-9897a248b00c",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e3a14029-2a51-48c2-b3c9-42ab5d9f5d06"
            },
            {
              "ID": "e24fdb4c-799b-40e0-9e85-a51a20c5b62a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "88f17dd2-3af9-456b-9610-93f69006b068"
            },
            {
              "ID": "b7bd9330-546f-4e8a-bdb8-b1fc0b6acadf",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "4b7e6ffe-7af2-4cce-a2e2-1beab933174e"
            },
            {
              "ID": "034fb4f2-7dfb-4ef9-a1d5-ce4deb95ae12",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "328f7d74-8f77-4393-aece-7752f64757f6"
            },
            {
              "ID": "e672ee08-4318-439a-aedf-d89b1ac774ab",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fb2ae4ea-1897-4e9a-83d6-313dc0d66694"
            },
            {
              "ID": "9c9ae888-dc3a-4770-93d7-e164607a44b3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8952c22a-bca2-4c15-9d10-54cd58ec0012"
            },
            {
              "ID": "cda63ef2-db00-487c-8faa-f9fc88369718",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e552a796-bf09-436a-9d9c-0b2138096ac0"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "11d3cad4-370c-42c4-9335-fcd9c1c45306",
          "ObjectID": null,
          "ObjectID_Tosave": "8c334990-19ad-49f7-bd35-a6b32da20360",
          "QueryName": "Detail_TABD_Triggers",
          "DisplayName": "Detail_TABD_Triggers",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "b3fa7387-cfea-4d8b-ac09-00e38c8bc735",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "3fbca3e8-5fda-426c-9c1b-0a404dec963c"
            },
            {
              "ID": "5986ea14-fa67-48cb-ac16-06cd33841549",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.BlueprintId",
              "AppFieldID": "5ec8bdd1-2da3-4759-855a-e2eccf767d35"
            },
            {
              "ID": "65ad33ab-df58-4afe-9fb2-2ce5d8d31ea2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "4b7e6ffe-7af2-4cce-a2e2-1beab933174e"
            },
            {
              "ID": "74521313-1734-41ad-8af5-33d77b39a7af",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.IsActive",
              "AppFieldID": "7fede379-4b82-4ba6-ac6c-da9c5bd3db9b"
            },
            {
              "ID": "736c2a1a-3ad2-49e4-ba19-35a5dd6f5204",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "d76e356d-3bcb-4d55-8cf1-2a670fa8acee"
            },
            {
              "ID": "549de3bb-15c0-4102-83fc-374715c1de4f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8a350bf0-c1a7-4f72-be3a-9a724fb9b2c8"
            },
            {
              "ID": "45a4885e-c026-4fee-9555-50b62efae013",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.BlueprintStatusId",
              "AppFieldID": "3c4d1c3e-a3a6-44bd-a815-a9c6cfbe003c"
            },
            {
              "ID": "4c54f774-237a-4fda-8d1f-50b8ad7d8107",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "328f7d74-8f77-4393-aece-7752f64757f6"
            },
            {
              "ID": "693a3ef4-6a16-4dd1-a75c-5876bb96b415",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e3a14029-2a51-48c2-b3c9-42ab5d9f5d06"
            },
            {
              "ID": "30a8c83b-27ce-4d35-bc52-5fa3b06f30c9",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "8952c22a-bca2-4c15-9d10-54cd58ec0012"
            },
            {
              "ID": "8e0cf69b-a558-449d-ba04-62bc64a69079",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.IsSystemRecord",
              "AppFieldID": "7c3e041e-6086-48f0-9ba8-61da0e241b29"
            },
            {
              "ID": "84911d37-7e98-4961-98b1-73820cb3e738",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6cce138e-a4d0-4e5f-b122-81576d42b8bd"
            },
            {
              "ID": "f18daf84-c1b3-4990-a615-826055f06639",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.TenantId",
              "AppFieldID": "f9a5bee3-f20c-47db-bbd4-ac0d972985f5"
            },
            {
              "ID": "20c61341-061c-4e80-aab8-a0935535edab",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.PrimaryKey",
              "AppFieldID": "1765e7e6-c1f1-454d-abcf-2584ed643720"
            },
            {
              "ID": "4f47b2e2-48c1-42e8-b7c0-a96a5cd207f0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.RecordId",
              "AppFieldID": "d3661c2c-e872-4f5a-9030-4c8f97c704c5"
            },
            {
              "ID": "dcad18e3-577f-4a87-921f-cb670430cc58",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fb2ae4ea-1897-4e9a-83d6-313dc0d66694"
            },
            {
              "ID": "d8346904-cb8a-4a2c-8879-e24a35371168",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "fd673eb1-f9d5-4ab3-bb18-6ecaae3ac7fc"
            },
            {
              "ID": "3dbda50e-5751-4361-83f1-e626c626186e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "e552a796-bf09-436a-9d9c-0b2138096ac0"
            },
            {
              "ID": "77518c44-517a-4e51-b715-fc85ee8f1d0f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 2,
              "FieldDetails": "RecordInfo.AppObjectID",
              "AppFieldID": "497cbcb0-e5eb-4fcd-84d3-bebc4348069e"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "5e041108-5f31-43df-86f6-cfb95154e39d",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "ID",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 0,
                "FieldID": "328f7d74-8f77-4393-aece-7752f64757f6"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "3fb40377-901c-4f59-a61e-8812ce472fae",
              "ParameterName": "ID",
              "DataSourceQueryID": "11d3cad4-370c-42c4-9335-fcd9c1c45306",
              "MappingFieldName": "ID",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "TABD_Triggers",
      "Resources": null,
      "IsSystem": false,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 1,
      "CRUDAppObjectId": "8c334990-19ad-49f7-bd35-a6b32da20360",
      "AppObjectConfiguration": null,
      "AllowVersioning": false,
      "IsSupportBluePrint": null,
      "IsLocationTracking": null,
      "AllowSoftDelete": true,
      "IsReplicationNeeded": null,
      "IsCacheEnable": false,
      "CacheTtl": null,
      "ConnectionId": "0a08b86a-dd7b-4695-ada9-6d6dae85af59",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "d052a189-a33f-4acd-8012-f66f9cc07cd3",
        "UpdatedBy": null,
        "CreatedOn": "2025-05-13T16:09:41.127",
        "UpdatedOn": "2025-05-15T08:02:27",
        "IsSystemRecord": null,
        "AppId": "92a3f57f-eb81-42d9-bcbb-dcaf9420d3d3"
      }
    },
    {
      "ID": "460ffb4d-1ab5-44f3-b3c7-b6ade6658c8e",
      "ObjectName": "VW_UserTenantEnvironmentMapping",
      "DisplayName": "VW_UserTenantEnvironmentMapping",
      "Description": null,
      "EnableTracking": true,
      "AllowSearchable": true,
      "CreationType": 1,
      "AllowReports": true,
      "AllowActivities": true,
      "AllowSharing": true,
      "DeploymentStatus": 1,
      "Fields": [
        {
          "ID": "55180617-4925-4c94-961a-04209cffe0e7",
          "ObjectID": null,
          "ObjectID_Tosave": "460ffb4d-1ab5-44f3-b3c7-b6ade6658c8e",
          "FieldName": "Sequence",
          "DisplayName": "Sequence",
          "FieldType": {
            "DataType": 2,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "Sequence",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "21ce3553-e5e7-43d7-8027-3f69fe03bb7c",
          "ObjectID": null,
          "ObjectID_Tosave": "460ffb4d-1ab5-44f3-b3c7-b6ade6658c8e",
          "FieldName": "EnvironmentName",
          "DisplayName": "EnvironmentName",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "EnvironmentName",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "31f8de8d-e051-47b9-ab18-488a301ebc15",
          "ObjectID": null,
          "ObjectID_Tosave": "460ffb4d-1ab5-44f3-b3c7-b6ade6658c8e",
          "FieldName": "ReleaseVersion",
          "DisplayName": "ReleaseVersion",
          "FieldType": {
            "DataType": 13,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "ReleaseVersion",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "2f29b725-0eca-4b52-a7ed-5133cb7e2d44",
          "ObjectID": null,
          "ObjectID_Tosave": "460ffb4d-1ab5-44f3-b3c7-b6ade6658c8e",
          "FieldName": "AppEnvironmentId",
          "DisplayName": "AppEnvironmentId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "AppEnvironmentId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "c25d51a5-1537-4f92-9da5-5f9699ed4633",
          "ObjectID": null,
          "ObjectID_Tosave": "460ffb4d-1ab5-44f3-b3c7-b6ade6658c8e",
          "FieldName": "TenantRecordId",
          "DisplayName": "TenantRecordId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "TenantRecordId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "1d1ca5c5-8f2d-4a8c-9b88-605955f27785",
          "ObjectID": null,
          "ObjectID_Tosave": "460ffb4d-1ab5-44f3-b3c7-b6ade6658c8e",
          "FieldName": "AppId",
          "DisplayName": "AppId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "AppId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "bc031789-20a3-439f-87df-80a6829740a6",
          "ObjectID": null,
          "ObjectID_Tosave": "460ffb4d-1ab5-44f3-b3c7-b6ade6658c8e",
          "FieldName": "UserId",
          "DisplayName": "UserId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "UserId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "ea8d6a36-8eb2-463c-b3c2-d6b5f311f66e",
          "ObjectID": null,
          "ObjectID_Tosave": "460ffb4d-1ab5-44f3-b3c7-b6ade6658c8e",
          "FieldName": "RecordInfo",
          "DisplayName": "RecordInfo",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": false,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": false,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "RecordInfo",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": {
            "LookupObject": "TABD_RecordInfoView",
            "LookupField": "PrimaryKey",
            "DisplayField": "PrimaryKey",
            "selectQuery": {
              "RawSQL_AppfieldIds": null,
              "ResultField_AppfieldIds": null,
              "Sort": null,
              "Distinct": false,
              "NoLock": true,
              "TopCount": null,
              "Includes": [],
              "pager": null,
              "RecordState": 3,
              "GlobalSearch": null,
              "IsPager": true,
              "DSQId": null,
              "GroupByFields": null,
              "QueryObjectID": "TABD_RecordInfoView",
              "QueryType": 0,
              "Joins": [],
              "WhereClause": {
                "Filters": [
                  {
                    "ID": "00000000-0000-0000-0000-000000000000",
                    "ConjuctionClause": 1,
                    "FieldID": "AppObjectID",
                    "RelationalOperator": 3,
                    "ValueType": 1,
                    "Value": "460ffb4d-1ab5-44f3-b3c7-b6ade6658c8e",
                    "Sequence": 1,
                    "GroupID": 0,
                    "FieldType": 0,
                    "LookUpDetail": null
                  }
                ],
                "FilterLogic": "1"
              },
              "Reqtokens": null,
              "HavingClause": null,
              "RequestId": "00000000-0000-0000-0000-000000000000"
            }
          },
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        },
        {
          "ID": "6d393c99-c4f3-421d-9367-e3a941faaed8",
          "ObjectID": null,
          "ObjectID_Tosave": "460ffb4d-1ab5-44f3-b3c7-b6ade6658c8e",
          "FieldName": "TenantEnvId",
          "DisplayName": "TenantEnvId",
          "FieldType": {
            "DataType": 17,
            "RelationalOperator": null
          },
          "FieldBase": null,
          "Description": null,
          "CreationType": 1,
          "IsRequired": true,
          "IsUnique": false,
          "BaseField": null,
          "IsSearchable": true,
          "IsUpdatable": false,
          "IsConfidential": false,
          "SystemDBFieldName": "TenantEnvId",
          "IsSystem": false,
          "IsVisible": false,
          "IsPrimaryKey": false,
          "IsDeprecated": false,
          "IsDisplayField": false,
          "LookUpDetails": null,
          "AccessList": null,
          "Data": null,
          "FieldConfiguration": null,
          "FieldValidatorConfiguration": null
        }
      ],
      "ChildRelationShips": null,
      "DataSourceQueries": [
        {
          "ID": "48fcc438-79e2-49ea-a839-0dbb54066b02",
          "ObjectID": null,
          "ObjectID_Tosave": "460ffb4d-1ab5-44f3-b3c7-b6ade6658c8e",
          "QueryName": "Get_VW_UserTenantEnvironmentMapping",
          "DisplayName": "Get_VW_UserTenantEnvironmentMapping",
          "FilterLogic": "[1 AND [2]]",
          "Fields": [
            {
              "ID": "922454e9-6584-4147-be3a-0ea7c795049a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c25d51a5-1537-4f92-9da5-5f9699ed4633"
            },
            {
              "ID": "ac32ace1-2bf3-43cd-bc22-50df0b474ffe",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6d393c99-c4f3-421d-9367-e3a941faaed8"
            },
            {
              "ID": "2348b92d-8f99-412e-9eb4-668b9c890642",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1d1ca5c5-8f2d-4a8c-9b88-605955f27785"
            },
            {
              "ID": "2c4ad6a1-d09d-40cc-9ce0-923be855a4a0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "31f8de8d-e051-47b9-ab18-488a301ebc15"
            },
            {
              "ID": "bcf56da7-4edf-4fff-95ba-b29e4332ebde",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "21ce3553-e5e7-43d7-8027-3f69fe03bb7c"
            },
            {
              "ID": "c3dd5084-5c3b-4db9-8a97-dff3a9681cba",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "bc031789-20a3-439f-87df-80a6829740a6"
            },
            {
              "ID": "316c9b19-4b47-4d7b-9edb-e883777a3e44",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "2f29b725-0eca-4b52-a7ed-5133cb7e2d44"
            },
            {
              "ID": "0ba8138c-808c-4a1f-9479-fb7a77986fa0",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "55180617-4925-4c94-961a-04209cffe0e7"
            }
          ],
          "Filters": {
            "Filters": [
              {
                "ID": "49697923-c12a-a32c-f61b-121e028a505a",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "AppId",
                "Sequence": 1,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "1d1ca5c5-8f2d-4a8c-9b88-605955f27785"
              },
              {
                "ID": "f2787199-9233-5f5a-e524-3b92ba45f2e0",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 4,
                "value": "{{LOGGEDINUSER}}",
                "Sequence": 2,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "bc031789-20a3-439f-87df-80a6829740a6"
              },
              {
                "ID": "25e208bf-83a2-99cc-1f4c-f5a5f3382415",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "TenantId",
                "Sequence": 3,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "6d393c99-c4f3-421d-9367-e3a941faaed8"
              },
              {
                "ID": "d6a61ff4-d9a1-3ff2-016c-2e5f9366b160",
                "ConjuctionClause": 1,
                "RelationalOperator": 3,
                "ValueType": 2,
                "value": "TenantId",
                "Sequence": 4,
                "GroupID": 1,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "c25d51a5-1537-4f92-9da5-5f9699ed4633"
              },
              {
                "ID": "bec374d0-b6d1-e0f4-9f83-2159a023d428",
                "ConjuctionClause": 1,
                "RelationalOperator": 7,
                "ValueType": 0,
                "value": "",
                "Sequence": 1,
                "GroupID": 2,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "31f8de8d-e051-47b9-ab18-488a301ebc15"
              },
              {
                "ID": "e526bdfc-9f58-20b2-6389-33ae2c48af98",
                "ConjuctionClause": 2,
                "RelationalOperator": 3,
                "ValueType": 1,
                "value": "1",
                "Sequence": 2,
                "GroupID": 2,
                "LookupDetail": null,
                "FieldType": 1,
                "FieldID": "55180617-4925-4c94-961a-04209cffe0e7"
              }
            ],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [
            {
              "ID": "d5accaa9-1fef-4688-90c6-535ca41016d0",
              "ParameterName": "AppId",
              "DataSourceQueryID": "48fcc438-79e2-49ea-a839-0dbb54066b02",
              "MappingFieldName": "AppId",
              "IsMandatory": true
            },
            {
              "ID": "0f888cba-c210-46c1-a241-f9dabe877e43",
              "ParameterName": "TenantId",
              "DataSourceQueryID": "48fcc438-79e2-49ea-a839-0dbb54066b02",
              "MappingFieldName": "TenantId",
              "IsMandatory": true
            }
          ],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "79586faf-e82a-4302-a1e9-349d3f665a89",
          "ObjectID": null,
          "ObjectID_Tosave": "460ffb4d-1ab5-44f3-b3c7-b6ade6658c8e",
          "QueryName": "List_VW_UserTenantEnvironmentMapping",
          "DisplayName": "List_VW_UserTenantEnvironmentMapping",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "5e3e0fca-0baa-43db-96e5-d6c9542b88f3",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "21ce3553-e5e7-43d7-8027-3f69fe03bb7c"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "d99e839d-5e35-4582-aa67-cc063f7ad829",
          "ObjectID": null,
          "ObjectID_Tosave": "460ffb4d-1ab5-44f3-b3c7-b6ade6658c8e",
          "QueryName": "Default_VW_UserTenantEnvironmentMapping",
          "DisplayName": "Default_VW_UserTenantEnvironmentMapping",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "7a622644-842b-40a1-b264-1ba769003517",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "bc031789-20a3-439f-87df-80a6829740a6"
            },
            {
              "ID": "0dff605d-4479-470b-b530-893402af660e",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c25d51a5-1537-4f92-9da5-5f9699ed4633"
            },
            {
              "ID": "ad19a6f6-e8a3-4903-a5a5-905e3e744c5f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "55180617-4925-4c94-961a-04209cffe0e7"
            },
            {
              "ID": "359a47a6-d649-4499-9afa-a3a9a970b797",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6d393c99-c4f3-421d-9367-e3a941faaed8"
            },
            {
              "ID": "48735be1-837d-4f79-ae41-b3225b547114",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ea8d6a36-8eb2-463c-b3c2-d6b5f311f66e"
            },
            {
              "ID": "a93e9718-1f53-4d07-93ec-bd1633d0ff90",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "31f8de8d-e051-47b9-ab18-488a301ebc15"
            },
            {
              "ID": "c07c530f-e2be-4063-888c-c4b3bc88c811",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1d1ca5c5-8f2d-4a8c-9b88-605955f27785"
            },
            {
              "ID": "a3f88e9e-75f1-43a2-b36e-d34dcafd3de2",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "21ce3553-e5e7-43d7-8027-3f69fe03bb7c"
            },
            {
              "ID": "50fe1035-d4f7-47da-abf9-fa9adde99ea8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "2f29b725-0eca-4b52-a7ed-5133cb7e2d44"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        },
        {
          "ID": "60931c08-b633-4141-9ac2-ffb7b5c9e09a",
          "ObjectID": null,
          "ObjectID_Tosave": "460ffb4d-1ab5-44f3-b3c7-b6ade6658c8e",
          "QueryName": "DEV_VW_UserTenantEnvironmentMapping",
          "DisplayName": "DEV_VW_UserTenantEnvironmentMapping",
          "FilterLogic": null,
          "Fields": [
            {
              "ID": "410260fc-1472-4324-ade4-05fa0657a648",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "55180617-4925-4c94-961a-04209cffe0e7"
            },
            {
              "ID": "b0b6c427-2f3f-4ac7-a9c2-0db177e58ffc",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "6d393c99-c4f3-421d-9367-e3a941faaed8"
            },
            {
              "ID": "f9851599-6278-4fff-9669-502a0cf961e8",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "ea8d6a36-8eb2-463c-b3c2-d6b5f311f66e"
            },
            {
              "ID": "3af10fa5-6f69-4b0b-a2f5-5c0a67900a00",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "31f8de8d-e051-47b9-ab18-488a301ebc15"
            },
            {
              "ID": "5c37c7f2-bbf3-4d4a-a3d3-b05d92cc982f",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "bc031789-20a3-439f-87df-80a6829740a6"
            },
            {
              "ID": "5416f9f3-dd51-40f3-b77e-d2018e42159a",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "2f29b725-0eca-4b52-a7ed-5133cb7e2d44"
            },
            {
              "ID": "47eaa412-0e7b-4d84-b131-debf2f842720",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "c25d51a5-1537-4f92-9da5-5f9699ed4633"
            },
            {
              "ID": "3fd530ff-635b-494b-8b52-e51ee8c34e69",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "21ce3553-e5e7-43d7-8027-3f69fe03bb7c"
            },
            {
              "ID": "0627a041-3061-494f-83f9-fdf6c37186b4",
              "SeqNo": 0,
              "Field_GridAttributes": null,
              "LookupDetails": null,
              "FieldType": 1,
              "FieldDetails": null,
              "AppFieldID": "1d1ca5c5-8f2d-4a8c-9b88-605955f27785"
            }
          ],
          "Filters": {
            "Filters": [],
            "FilterLogic": null
          },
          "Sort": [],
          "Parameters": [],
          "RequestId": "00000000-0000-0000-0000-000000000000"
        }
      ],
      "SystemDBTableName": "VW_UserTenantEnvironmentMapping",
      "Resources": null,
      "IsSystem": false,
      "IsVisible": false,
      "IsDeprecated": false,
      "ObjectType": 2,
      "CRUDAppObjectId": null,
      "AppObjectConfiguration": null,
      "AllowVersioning": false,
      "IsSupportBluePrint": null,
      "IsLocationTracking": null,
      "AllowSoftDelete": true,
      "IsReplicationNeeded": null,
      "IsCacheEnable": false,
      "CacheTtl": null,
      "ConnectionId": "8ccb12d3-3a42-4871-8494-1b541a796ca2",
      "AccessList": [],
      "IsSupportLayout": null,
      "RecordInfo": {
        "CreatedBy": "d052a189-a33f-4acd-8012-f66f9cc07cd3",
        "UpdatedBy": null,
        "CreatedOn": "2025-08-19T14:14:55",
        "UpdatedOn": null,
        "IsSystemRecord": false,
        "AppId": "92a3f57f-eb81-42d9-bcbb-dcaf9420d3d3"
      }
    }
    ];

    // Map the raw API data to the internal SchemaData format
    this.dummySchema = this.mapApiDataToSchema(rawApiData);
  }

  /**
   * Get all AppObjects (tables/views) with their fields
   */
  getSchema(): Observable<SchemaData> {
    // Simulate API delay
    return of(this.dummySchema).pipe(delay(300));
  }

  /**
   * Get single AppObject by name
   */
  getAppObjectByName(name: string): Observable<AppObject | undefined> {
    const appObject = this.dummySchema.appObjects.find(obj => obj.name === name);
    return of(appObject).pipe(delay(100));
  }

  /**
   * Get field by AppObject name and field name
   */
  getField(appObjectName: string, fieldName: string): Observable<Field | undefined> {
    const appObject = this.dummySchema.appObjects.find(obj => obj.name === appObjectName);
    const field = appObject?.fields.find(f => f.name === fieldName);
    return of(field).pipe(delay(50));
  }

  /**
   * Search AppObjects and Fields by name
   */
  searchSchema(searchTerm: string): Observable<SchemaData> {
    const term = searchTerm.toLowerCase();
    const filteredAppObjects: AppObject[] = [];

    this.dummySchema.appObjects.forEach(appObject => {
      const matchingFields = appObject.fields.filter(field => 
        field.name.toLowerCase().includes(term) || 
        field.displayName.toLowerCase().includes(term)
      );

      if (appObject.name.toLowerCase().includes(term) || 
          appObject.displayName.toLowerCase().includes(term) || 
          matchingFields.length > 0) {
        filteredAppObjects.push({
          ...appObject,
          fields: matchingFields.length > 0 ? matchingFields : appObject.fields
        });
      }
    });

    return of({ appObjects: filteredAppObjects }).pipe(delay(100));
  }

  /**
   * Get all unique AppObject names for autocomplete
   */
  getAppObjectNames(): string[] {
    return this.dummySchema.appObjects.map(obj => obj.name);
  }

  /**
   * Get all fields for an AppObject
   */
  getAppObjectFields(appObjectName: string): Field[] {
    const appObject = this.dummySchema.appObjects.find(obj => obj.name === appObjectName);
    return appObject?.fields || [];
  }

  /**
   * Get qualified field name (TableName.FieldName)
   */
  getQualifiedFieldName(appObjectName: string, fieldName: string): string {
    return `${appObjectName}.${fieldName}`;
  }
}
