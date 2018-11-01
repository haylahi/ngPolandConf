"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("@angular/common/http");
var core_1 = require("@angular/core");
var marked = require("marked");
var operators_1 = require("rxjs/operators");
var environment_prod_1 = require("../../environments/environment.prod");
var settings_service_1 = require("./settings.service");
var event_item_model_1 = require("../models/event-item.model");
var info_item_model_1 = require("../models/info-item.model");
var simple_content_model_1 = require("../models/simple-content.model");
var speaker_model_1 = require("../models/speaker.model");
var workshop_model_1 = require("../models/workshop.model");
var EventContentTypes;
(function (EventContentTypes) {
    EventContentTypes["SPEAKER"] = "speaker";
    EventContentTypes["WORKSHOP"] = "workshop";
    EventContentTypes["EVENT_ITEM"] = "eventItem";
    EventContentTypes["SIMPLE_CONTENT"] = "simpleContent";
    EventContentTypes["INFO_ITEM"] = "infoItem";
})(EventContentTypes = exports.EventContentTypes || (exports.EventContentTypes = {}));
var EventItemType;
(function (EventItemType) {
    EventItemType["NGPOLAND"] = "ngPoland";
    EventItemType["JSPOLAND"] = "jsPoland";
})(EventItemType = exports.EventItemType || (exports.EventItemType = {}));
var EventItemCategory;
(function (EventItemCategory) {
    EventItemCategory["PRESENTATION"] = "presentation";
    EventItemCategory["BREAK"] = "break";
    EventItemCategory["EATING"] = "eating";
    EventItemCategory["QA"] = "qa";
})(EventItemCategory = exports.EventItemCategory || (exports.EventItemCategory = {}));
var ContentfulService = /** @class */ (function () {
    function ContentfulService(settings, http) {
        this.settings = settings;
        this.http = http;
        this.CONTENTFUL_URL = "https://cdn.contentful.com";
        this.CONTENTFUL_URL_ENTRIES = this.CONTENTFUL_URL + "/spaces/" + environment_prod_1.environment.contentful.spaceId + "/environments/master/entries?access_token=" + environment_prod_1.environment.contentful.token;
    }
    ContentfulService.prototype.getContentfulUrlEntry = function (entryId) {
        return "https://cdn.contentful.com/spaces/" + environment_prod_1.environment.contentful.spaceId + "/environments/master/entries/" + entryId + "?access_token=" + environment_prod_1.environment.contentful.token;
    };
    ContentfulService.prototype.getContentfulUrlParameters = function (params) {
        return Object.entries(params)
            .map(function (_a) {
            var key = _a[0], val = _a[1];
            return key + "=" + val;
        })
            .join("&");
    };
    ContentfulService.prototype.getInfoItems = function (howMany) {
        var query = {
            content_type: EventContentTypes.INFO_ITEM,
            locale: this.settings.getLocale(),
            order: "fields.order",
            limit: howMany
        };
        return this.http
            .get(this.CONTENTFUL_URL_ENTRIES + "&" + this.getContentfulUrlParameters(query), { responseType: "json" })
            .pipe(operators_1.map(function (entries) {
            return entries.items.map(function (item) {
                return new info_item_model_1.InfoItem(item.fields.title, item.fields.ordre, item.fields.icon, item.fields.description, item.fields.urlLink);
            });
        }));
    };
    ContentfulService.prototype.getEventItems = function (howMany, type) {
        var _this = this;
        var query = {
            content_type: EventContentTypes.EVENT_ITEM,
            locale: this.settings.getLocale(),
            "fields.type": type,
            order: "fields.startDate",
            limit: howMany
        };
        return this.http
            .get(this.CONTENTFUL_URL_ENTRIES + "&" + this.getContentfulUrlParameters(query), { responseType: "json" })
            .pipe(operators_1.map(function (entries) {
            var assets = null;
            var links = null;
            if (entries.includes) {
                assets = entries.includes.Asset;
                links = entries.includes.Entry;
            }
            return entries.items.map(function (item) {
                var speaker = null;
                if (links && item.fields.presenter) {
                    speaker = _this.getEntryById(links, item.fields.presenter.sys.id);
                }
                var speakerPhoto = null;
                if (speaker) {
                    speakerPhoto = _this.getAssetById(assets, speaker.fields.photo.sys.id);
                }
                return new event_item_model_1.EventItem(item.fields.title, item.fields.type, item.fields.category, item.fields.shortDescription, item.fields.description, item.fields.startDate, item.fields.endDate, speaker
                    ? new speaker_model_1.Speaker(speaker.fields.name, speaker.fields.role, speaker.fields.bio, speakerPhoto ? speakerPhoto.fields.file.url : undefined, speakerPhoto ? speakerPhoto.fields.title : undefined, speakerPhoto ? speakerPhoto.fields.description : undefined, speaker.fields.email, speaker.fields.urlGithub, speaker.fields.urlLinkedIn, speaker.fields.urlTwitter, speaker.fields.urlWww)
                    : undefined);
            });
        }));
    };
    ContentfulService.prototype.getSimpleContentById = function (myId) {
        var query = {
            content_type: EventContentTypes.SIMPLE_CONTENT,
            locale: this.settings.getLocale(),
            "fields.myId": myId,
            limit: 1
        };
        return this.http
            .get(this.CONTENTFUL_URL_ENTRIES + "&" + this.getContentfulUrlParameters(query), { responseType: "json" })
            .pipe(operators_1.map(function (entries) {
            if (entries && entries.items && entries.items[0]) {
                return new simple_content_model_1.SimpleContent(entries.items[0].fields.myId, entries.items[0].fields.title, entries.items[0].fields.text);
            }
            else {
                return new simple_content_model_1.SimpleContent("000", "nie udało się", "nie wyszło coś");
            }
        }));
    };
    ContentfulService.prototype.getWorkshops = function (howMany) {
        var _this = this;
        var query = {
            content_type: EventContentTypes.WORKSHOP,
            locale: this.settings.getLocale(),
            order: "sys.createdAt",
            limit: howMany
        };
        return this.http
            .get(this.CONTENTFUL_URL_ENTRIES + "&" + this.getContentfulUrlParameters(query), { responseType: "json" })
            .pipe(operators_1.map(function (entries) {
            var assets = entries.includes.Asset;
            var links = entries.includes.Entry;
            return entries.items.map(function (item) {
                //  const profilePhoto: Asset = this.getAssetById(assets, item.fields.photo.sys.id);
                var speaker = _this.getEntryById(links, item.fields.instructor.sys.id);
                // console.log("Spekaer: ", speaker);
                var speakerPhoto = _this.getAssetById(assets, speaker.fields.photo.sys.id);
                return new workshop_model_1.Workshop(item.fields.title, item.fields.description, new speaker_model_1.Speaker(speaker.fields.name, speaker.fields.role, speaker.fields.bio, speakerPhoto ? speakerPhoto.fields.file.url : undefined, speakerPhoto ? speakerPhoto.fields.title : undefined, speakerPhoto ? speakerPhoto.fields.description : undefined, speaker.fields.email, speaker.fields.urlGithub, speaker.fields.urlLinkedIn, speaker.fields.urlTwitter, speaker.fields.urlWww), item.fields.startDate, item.fields.endDate, 0, // TODO: zamienić na współrzędne
                0, // TODO: zamienić na współrzędne
                item.fields.locationDescription, item.fields.pricePln);
            });
        }));
    };
    ContentfulService.prototype.getSpeakers = function (howMany) {
        var _this = this;
        var query = {
            content_type: EventContentTypes.SPEAKER,
            locale: this.settings.getLocale(),
            order: "sys.createdAt",
            limit: howMany
        };
        return this.http
            .get(this.CONTENTFUL_URL_ENTRIES + "&" + this.getContentfulUrlParameters(query), { responseType: "json" })
            .pipe(operators_1.map(function (entries) {
            var assets = entries.includes.Asset;
            return entries.items.map(function (item) {
                var profilePhoto = _this.getAssetById(assets, item.fields.photo.sys.id);
                return new speaker_model_1.Speaker(item.fields.name, item.fields.role, item.fields.bio, profilePhoto ? profilePhoto.fields.file.url : undefined, profilePhoto ? profilePhoto.fields.title : undefined, profilePhoto ? profilePhoto.fields.description : undefined, item.fields.email, item.fields.urlGithub, item.fields.urlLinkedIn, item.fields.urlTwitter, item.fields.urlWww);
            });
        }));
    };
    ContentfulService.prototype.markdownToHtml = function (md) {
        return marked(md);
    };
    ContentfulService.prototype.getAssetById = function (assetArray, id) {
        if (assetArray && assetArray.length > 0) {
            var newArray = assetArray.filter(function (item) { return item.sys.id === id; });
            if (newArray && newArray.length > 0) {
                return newArray[0];
            }
        }
        return {};
    };
    ContentfulService.prototype.getAssetsByIds = function (assetArray, ids) {
        if (assetArray && assetArray.length > 0 && ids && ids.length > 0) {
            var newArray = assetArray.filter(function (item) {
                return ids.includes(item.sys.id);
            });
            return newArray;
        }
        return {};
    };
    ContentfulService.prototype.getEntryById = function (entriesArray, id) {
        if (entriesArray && entriesArray.length > 0) {
            var newArray = entriesArray.filter(function (item) { return item.sys.id === id; });
            if (newArray && newArray.length > 0) {
                return newArray[0];
            }
        }
        return {};
    };
    ContentfulService.prototype.getEntriesByContentType = function (entriesArray, contentType) {
        if (entriesArray && entriesArray.length > 0) {
            var newArray = entriesArray.filter(function (item) { return item.sys.contentType.sys.id === contentType; });
            if (newArray && newArray.length > 0) {
                return newArray;
            }
        }
        return {};
    };
    ContentfulService = __decorate([
        core_1.Injectable({
            providedIn: "root"
        }),
        __metadata("design:paramtypes", [settings_service_1.SettingsService, http_1.HttpClient])
    ], ContentfulService);
    return ContentfulService;
}());
exports.ContentfulService = ContentfulService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudGZ1bC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29udGVudGZ1bC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkNBQWtEO0FBQ2xELHNDQUEyQztBQUUzQywrQkFBaUM7QUFFakMsNENBQTBDO0FBQzFDLHdFQUFrRTtBQUNsRSx1REFBcUQ7QUFFckQsK0RBQXVEO0FBQ3ZELDZEQUFxRDtBQUNyRCx1RUFBK0Q7QUFDL0QseURBQWtEO0FBQ2xELDJEQUFvRDtBQUVwRCxJQUFZLGlCQU1YO0FBTkQsV0FBWSxpQkFBaUI7SUFDM0Isd0NBQW1CLENBQUE7SUFDbkIsMENBQXFCLENBQUE7SUFDckIsNkNBQXdCLENBQUE7SUFDeEIscURBQWdDLENBQUE7SUFDaEMsMkNBQXNCLENBQUE7QUFDeEIsQ0FBQyxFQU5XLGlCQUFpQixHQUFqQix5QkFBaUIsS0FBakIseUJBQWlCLFFBTTVCO0FBRUQsSUFBWSxhQUdYO0FBSEQsV0FBWSxhQUFhO0lBQ3ZCLHNDQUFxQixDQUFBO0lBQ3JCLHNDQUFxQixDQUFBO0FBQ3ZCLENBQUMsRUFIVyxhQUFhLEdBQWIscUJBQWEsS0FBYixxQkFBYSxRQUd4QjtBQUVELElBQVksaUJBS1g7QUFMRCxXQUFZLGlCQUFpQjtJQUMzQixrREFBNkIsQ0FBQTtJQUM3QixvQ0FBZSxDQUFBO0lBQ2Ysc0NBQWlCLENBQUE7SUFDakIsOEJBQVMsQ0FBQTtBQUNYLENBQUMsRUFMVyxpQkFBaUIsR0FBakIseUJBQWlCLEtBQWpCLHlCQUFpQixRQUs1QjtBQUtEO0lBTUUsMkJBQW9CLFFBQXlCLEVBQVUsSUFBZ0I7UUFBbkQsYUFBUSxHQUFSLFFBQVEsQ0FBaUI7UUFBVSxTQUFJLEdBQUosSUFBSSxDQUFZO1FBTHRELG1CQUFjLEdBQUcsNEJBQTRCLENBQUM7UUFDOUMsMkJBQXNCLEdBQU0sSUFBSSxDQUFDLGNBQWMsZ0JBQzlELDhCQUFXLENBQUMsVUFBVSxDQUFDLE9BQU8sa0RBQ2Es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QUM7UUFFRCxNQUFNLENBQUMsRUFBRSxDQUFDO0lBQ1osQ0FBQztJQXhUVSxpQkFBaUI7UUFIN0IsaUJBQVUsQ0FBQztZQUNWLFVBQVUsRUFBRSxNQUFNO1NBQ25CLENBQUM7eUNBTzhCLGtDQUFlLEVBQWdCLGlCQUFVO09BTjVELGlCQUFpQixDQTBUN0I7SUFBRCx3QkFBQztDQUFBLEFBMVRELElBMFRDO0FBMVRZLDhDQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uL2h0dHBcIjtcclxuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XHJcbmltcG9ydCB7IEFzc2V0LCBFbnRyeSwgRW50cnlDb2xsZWN0aW9uIH0gZnJvbSBcImNvbnRlbnRmdWxcIjtcclxuaW1wb3J0ICogYXMgbWFya2VkIGZyb20gXCJtYXJrZWRcIjtcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gXCJyeGpzXCI7XHJcbmltcG9ydCB7IG1hcCwgdGFwIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XHJcbmltcG9ydCB7IGVudmlyb25tZW50IH0gZnJvbSBcIi4uLy4uL2Vudmlyb25tZW50cy9lbnZpcm9ubWVudC5wcm9kXCI7XHJcbmltcG9ydCB7IFNldHRpbmdzU2VydmljZSB9IGZyb20gXCIuL3NldHRpbmdzLnNlcnZpY2VcIjtcclxuXHJcbmltcG9ydCB7IEV2ZW50SXRlbSB9IGZyb20gXCIuLi9tb2RlbHMvZXZlbnQtaXRlbS5tb2RlbFwiO1xyXG5pbXBvcnQgeyBJbmZvSXRlbSB9IGZyb20gXCIuLi9tb2RlbHMvaW5mby1pdGVtLm1vZGVsXCI7XHJcbmltcG9ydCB7IFNpbXBsZUNvbnRlbnQgfSBmcm9tIFwiLi4vbW9kZWxzL3NpbXBsZS1jb250ZW50Lm1vZGVsXCI7XHJcbmltcG9ydCB7IFNwZWFrZXIgfSBmcm9tIFwiLi4vbW9kZWxzL3NwZWFrZXIubW9kZWxcIjtcclxuaW1wb3J0IHsgV29ya3Nob3AgfSBmcm9tIFwiLi4vbW9kZWxzL3dvcmtzaG9wLm1vZGVsXCI7XHJcblxyXG5leHBvcnQgZW51bSBFdmVudENvbnRlbnRUeXBlcyB7XHJcbiAgU1BFQUtFUiA9IFwic3BlYWtlclwiLFxyXG4gIFdPUktTSE9QID0gXCJ3b3Jrc2hvcFwiLFxyXG4gIEVWRU5UX0lURU0gPSBcImV2ZW50SXRlbVwiLFxyXG4gIFNJTVBMRV9DT05URU5UID0gXCJzaW1wbGVDb250ZW50XCIsXHJcbiAgSU5GT19JVEVNID0gXCJpbmZvSXRlbVwiXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIEV2ZW50SXRlbVR5cGUge1xyXG4gIE5HUE9MQU5EID0gXCJuZ1BvbGFuZFwiLFxyXG4gIEpTUE9MQU5EID0gXCJqc1BvbGFuZFwiXHJcbn1cclxuXHJcbmV4cG9ydCBlbnVtIEV2ZW50SXRlbUNhdGVnb3J5IHtcclxuICBQUkVTRU5UQVRJT04gPSBcInByZXNlbnRhdGlvblwiLFxyXG4gIEJSRUFLID0gXCJicmVha1wiLFxyXG4gIEVBVElORyA9IFwiZWF0aW5nXCIsXHJcbiAgUUEgPSBcInFhXCJcclxufVxyXG5cclxuQEluamVjdGFibGUoe1xyXG4gIHByb3ZpZGVkSW46IFwicm9vdFwiXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDb250ZW50ZnVsU2VydmljZSB7XHJcbiAgcHJpdmF0ZSByZWFkb25seSBDT05URU5URlVMX1VSTCA9IFwiaHR0cHM6Ly9jZG4uY29udGVudGZ1bC5jb21cIjtcclxuICBwcml2YXRlIHJlYWRvbmx5IENPTlRFTlRGVUxfVVJMX0VOVFJJRVMgPSBgJHt0aGlzLkNPTlRFTlRGVUxfVVJMfS9zcGFjZXMvJHtcclxuICAgIGVudmlyb25tZW50LmNvbnRlbnRmdWwuc3BhY2VJZFxyXG4gIH0vZW52aXJvbm1lbnRzL21hc3Rlci9lbnRyaWVzP2FjY2Vzc190b2tlbj0ke2Vudmlyb25tZW50LmNvbnRlbnRmdWwudG9rZW59YDtcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBzZXR0aW5nczogU2V0dGluZ3NTZXJ2aWNlLCBwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQpIHt9XHJcblxyXG4gIGdldENvbnRlbnRmdWxVcmxFbnRyeShlbnRyeUlkOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGBodHRwczovL2Nkbi5jb250ZW50ZnVsLmNvbS9zcGFjZXMvJHtcclxuICAgICAgZW52aXJvbm1lbnQuY29udGVudGZ1bC5zcGFjZUlkXHJcbiAgICB9L2Vudmlyb25tZW50cy9tYXN0ZXIvZW50cmllcy8ke2VudHJ5SWR9P2FjY2Vzc190b2tlbj0ke1xyXG4gICAgICBlbnZpcm9ubWVudC5jb250ZW50ZnVsLnRva2VuXHJcbiAgICB9YDtcclxuICB9XHJcblxyXG4gIGdldENvbnRlbnRmdWxVcmxQYXJhbWV0ZXJzKHBhcmFtczoge30pOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKHBhcmFtcylcclxuICAgICAgLm1hcCgoW2tleSwgdmFsXSkgPT4gYCR7a2V5fT0ke3ZhbH1gKVxyXG4gICAgICAuam9pbihcIiZcIik7XHJcbiAgfVxyXG5cclxuICBnZXRJbmZvSXRlbXMoaG93TWFueTogbnVtYmVyKTogT2JzZXJ2YWJsZTxBcnJheTxJbmZvSXRlbT4+IHtcclxuICAgIGNvbnN0IHF1ZXJ5ID0ge1xyXG4gICAgICBjb250ZW50X3R5cGU6IEV2ZW50Q29udGVudFR5cGVzLklORk9fSVRFTSxcclxuICAgICAgbG9jYWxlOiB0aGlzLnNldHRpbmdzLmdldExvY2FsZSgpLFxyXG4gICAgICBvcmRlcjogXCJmaWVsZHMub3JkZXJcIixcclxuICAgICAgbGltaXQ6IGhvd01hbnlcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuaHR0cFxyXG4gICAgICAuZ2V0KFxyXG4gICAgICAgIGAke3RoaXMuQ09OVEVOVEZVTF9VUkxfRU5UUklFU30mJHt0aGlzLmdldENvbnRlbnRmdWxVcmxQYXJhbWV0ZXJzKFxyXG4gICAgICAgICAgcXVlcnlcclxuICAgICAgICApfWAsXHJcbiAgICAgICAgeyByZXNwb25zZVR5cGU6IFwianNvblwiIH1cclxuICAgICAgKVxyXG4gICAgICAucGlwZShcclxuICAgICAgICBtYXAoKGVudHJpZXM6IEVudHJ5Q29sbGVjdGlvbjxJbmZvSXRlbT4pID0+IHtcclxuXHJcbiAgICAgICAgICByZXR1cm4gZW50cmllcy5pdGVtcy5tYXAoKGl0ZW06IEVudHJ5PGFueT4pID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBJbmZvSXRlbShcclxuICAgICAgICAgICAgICBpdGVtLmZpZWxkcy50aXRsZSxcclxuICAgICAgICAgICAgICBpdGVtLmZpZWxkcy5vcmRyZSxcclxuICAgICAgICAgICAgICBpdGVtLmZpZWxkcy5pY29uLFxyXG4gICAgICAgICAgICAgIGl0ZW0uZmllbGRzLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgIGl0ZW0uZmllbGRzLnVybExpbmtcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICk7XHJcbiAgfVxyXG5cclxuICBnZXRFdmVudEl0ZW1zKFxyXG4gICAgaG93TWFueTogbnVtYmVyLFxyXG4gICAgdHlwZTogRXZlbnRJdGVtVHlwZVxyXG4gICk6IE9ic2VydmFibGU8QXJyYXk8RXZlbnRJdGVtPj4ge1xyXG4gICAgY29uc3QgcXVlcnkgPSB7XHJcbiAgICAgIGNvbnRlbnRfdHlwZTogRXZlbnRDb250ZW50VHlwZXMuRVZFTlRfSVRFTSxcclxuICAgICAgbG9jYWxlOiB0aGlzLnNldHRpbmdzLmdldExvY2FsZSgpLFxyXG4gICAgICBcImZpZWxkcy50eXBlXCI6IHR5cGUsXHJcbiAgICAgIG9yZGVyOiBcImZpZWxkcy5zdGFydERhdGVcIixcclxuICAgICAgbGltaXQ6IGhvd01hbnlcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuaHR0cFxyXG4gICAgICAuZ2V0KFxyXG4gICAgICAgIGAke3RoaXMuQ09OVEVOVEZVTF9VUkxfRU5UUklFU30mJHt0aGlzLmdldENvbnRlbnRmdWxVcmxQYXJhbWV0ZXJzKFxyXG4gICAgICAgICAgcXVlcnlcclxuICAgICAgICApfWAsXHJcbiAgICAgICAgeyByZXNwb25zZVR5cGU6IFwianNvblwiIH1cclxuICAgICAgKVxyXG4gICAgICAucGlwZShcclxuICAgICAgICBtYXAoKGVudHJpZXM6IEVudHJ5Q29sbGVjdGlvbjxFdmVudEl0ZW0+KSA9PiB7XHJcbiAgICAgICAgICBsZXQgYXNzZXRzOiBBcnJheTxBc3NldD4gPSBudWxsO1xyXG4gICAgICAgICAgbGV0IGxpbmtzOiBBcnJheTxFbnRyeTxhbnk+PiA9IG51bGw7XHJcblxyXG4gICAgICAgICAgaWYgKGVudHJpZXMuaW5jbHVkZXMpIHtcclxuICAgICAgICAgICAgYXNzZXRzID0gZW50cmllcy5pbmNsdWRlcy5Bc3NldDtcclxuICAgICAgICAgICAgbGlua3MgPSBlbnRyaWVzLmluY2x1ZGVzLkVudHJ5O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHJldHVybiBlbnRyaWVzLml0ZW1zLm1hcCgoaXRlbTogRW50cnk8YW55PikgPT4ge1xyXG4gICAgICAgICAgICBsZXQgc3BlYWtlciA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmIChsaW5rcyAmJiBpdGVtLmZpZWxkcy5wcmVzZW50ZXIpIHtcclxuICAgICAgICAgICAgICBzcGVha2VyID0gdGhpcy5nZXRFbnRyeUJ5SWQobGlua3MsIGl0ZW0uZmllbGRzLnByZXNlbnRlci5zeXMuaWQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgc3BlYWtlclBob3RvID0gbnVsbDtcclxuICAgICAgICAgICAgaWYgKHNwZWFrZXIpIHtcclxuICAgICAgICAgICAgICBzcGVha2VyUGhvdG8gPSB0aGlzLmdldEFzc2V0QnlJZChcclxuICAgICAgICAgICAgICAgIGFzc2V0cyxcclxuICAgICAgICAgICAgICAgIHNwZWFrZXIuZmllbGRzLnBob3RvLnN5cy5pZFxyXG4gICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgRXZlbnRJdGVtKFxyXG4gICAgICAgICAgICAgIGl0ZW0uZmllbGRzLnRpdGxlLFxyXG4gICAgICAgICAgICAgIGl0ZW0uZmllbGRzLnR5cGUsXHJcbiAgICAgICAgICAgICAgaXRlbS5maWVsZHMuY2F0ZWdvcnksXHJcbiAgICAgICAgICAgICAgaXRlbS5maWVsZHMuc2hvcnREZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICBpdGVtLmZpZWxkcy5kZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICBpdGVtLmZpZWxkcy5zdGFydERhdGUsXHJcbiAgICAgICAgICAgICAgaXRlbS5maWVsZHMuZW5kRGF0ZSxcclxuICAgICAgICAgICAgICBzcGVha2VyXHJcbiAgICAgICAgICAgICAgICA/IG5ldyBTcGVha2VyKFxyXG4gICAgICAgICAgICAgICAgICAgIHNwZWFrZXIuZmllbGRzLm5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgc3BlYWtlci5maWVsZHMucm9sZSxcclxuICAgICAgICAgICAgICAgICAgICBzcGVha2VyLmZpZWxkcy5iaW8sXHJcbiAgICAgICAgICAgICAgICAgICAgc3BlYWtlclBob3RvID8gc3BlYWtlclBob3RvLmZpZWxkcy5maWxlLnVybCA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBzcGVha2VyUGhvdG8gPyBzcGVha2VyUGhvdG8uZmllbGRzLnRpdGxlIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIHNwZWFrZXJQaG90byA/IHNwZWFrZXJQaG90by5maWVsZHMuZGVzY3JpcHRpb24gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgc3BlYWtlci5maWVsZHMuZW1haWwsXHJcbiAgICAgICAgICAgICAgICAgICAgc3BlYWtlci5maWVsZHMudXJsR2l0aHViLFxyXG4gICAgICAgICAgICAgICAgICAgIHNwZWFrZXIuZmllbGRzLnVybExpbmtlZEluLFxyXG4gICAgICAgICAgICAgICAgICAgIHNwZWFrZXIuZmllbGRzLnVybFR3aXR0ZXIsXHJcbiAgICAgICAgICAgICAgICAgICAgc3BlYWtlci5maWVsZHMudXJsV3d3XHJcbiAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIDogdW5kZWZpbmVkXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG4gIH1cclxuXHJcbiAgZ2V0U2ltcGxlQ29udGVudEJ5SWQobXlJZDogc3RyaW5nKTogT2JzZXJ2YWJsZTxTaW1wbGVDb250ZW50PiB7XHJcbiAgICBjb25zdCBxdWVyeSA9IHtcclxuICAgICAgY29udGVudF90eXBlOiBFdmVudENvbnRlbnRUeXBlcy5TSU1QTEVfQ09OVEVOVCxcclxuICAgICAgbG9jYWxlOiB0aGlzLnNldHRpbmdzLmdldExvY2FsZSgpLFxyXG4gICAgICBcImZpZWxkcy5teUlkXCI6IG15SWQsXHJcbiAgICAgIGxpbWl0OiAxXHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiB0aGlzLmh0dHBcclxuICAgICAgLmdldChcclxuICAgICAgICBgJHt0aGlzLkNPTlRFTlRGVUxfVVJMX0VOVFJJRVN9JiR7dGhpcy5nZXRDb250ZW50ZnVsVXJsUGFyYW1ldGVycyhcclxuICAgICAgICAgIHF1ZXJ5XHJcbiAgICAgICAgKX1gLFxyXG4gICAgICAgIHsgcmVzcG9uc2VUeXBlOiBcImpzb25cIiB9XHJcbiAgICAgIClcclxuICAgICAgLnBpcGUoXHJcbiAgICAgICAgbWFwKChlbnRyaWVzOiBFbnRyeUNvbGxlY3Rpb248U2ltcGxlQ29udGVudD4pID0+IHtcclxuICAgICAgICAgIGlmIChlbnRyaWVzICYmIGVudHJpZXMuaXRlbXMgJiYgZW50cmllcy5pdGVtc1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFNpbXBsZUNvbnRlbnQoXHJcbiAgICAgICAgICAgICAgZW50cmllcy5pdGVtc1swXS5maWVsZHMubXlJZCxcclxuICAgICAgICAgICAgICBlbnRyaWVzLml0ZW1zWzBdLmZpZWxkcy50aXRsZSxcclxuICAgICAgICAgICAgICBlbnRyaWVzLml0ZW1zWzBdLmZpZWxkcy50ZXh0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFNpbXBsZUNvbnRlbnQoXCIwMDBcIiwgXCJuaWUgdWRhxYJvIHNpxJlcIiwgXCJuaWUgd3lzesWCbyBjb8WbXCIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICk7XHJcbiAgfVxyXG5cclxuICBnZXRXb3Jrc2hvcHMoaG93TWFueTogbnVtYmVyKTogT2JzZXJ2YWJsZTxBcnJheTxXb3Jrc2hvcD4+IHtcclxuICAgIGNvbnN0IHF1ZXJ5ID0ge1xyXG4gICAgICBjb250ZW50X3R5cGU6IEV2ZW50Q29udGVudFR5cGVzLldPUktTSE9QLFxyXG4gICAgICBsb2NhbGU6IHRoaXMuc2V0dGluZ3MuZ2V0TG9jYWxlKCksXHJcbiAgICAgIG9yZGVyOiBcInN5cy5jcmVhdGVkQXRcIixcclxuICAgICAgbGltaXQ6IGhvd01hbnlcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuaHR0cFxyXG4gICAgICAuZ2V0KFxyXG4gICAgICAgIGAke3RoaXMuQ09OVEVOVEZVTF9VUkxfRU5UUklFU30mJHt0aGlzLmdldENvbnRlbnRmdWxVcmxQYXJhbWV0ZXJzKFxyXG4gICAgICAgICAgcXVlcnlcclxuICAgICAgICApfWAsXHJcbiAgICAgICAgeyByZXNwb25zZVR5cGU6IFwianNvblwiIH1cclxuICAgICAgKVxyXG4gICAgICAucGlwZShcclxuICAgICAgICBtYXAoKGVudHJpZXM6IEVudHJ5Q29sbGVjdGlvbjxhbnk+KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBhc3NldHM6IEFycmF5PEFzc2V0PiA9IGVudHJpZXMuaW5jbHVkZXMuQXNzZXQ7XHJcbiAgICAgICAgICBjb25zdCBsaW5rczogQXJyYXk8RW50cnk8YW55Pj4gPSBlbnRyaWVzLmluY2x1ZGVzLkVudHJ5O1xyXG5cclxuICAgICAgICAgIHJldHVybiBlbnRyaWVzLml0ZW1zLm1hcCgoaXRlbTogRW50cnk8YW55PikgPT4ge1xyXG4gICAgICAgICAgICAvLyAgY29uc3QgcHJvZmlsZVBob3RvOiBBc3NldCA9IHRoaXMuZ2V0QXNzZXRCeUlkKGFzc2V0cywgaXRlbS5maWVsZHMucGhvdG8uc3lzLmlkKTtcclxuICAgICAgICAgICAgY29uc3Qgc3BlYWtlciA9IHRoaXMuZ2V0RW50cnlCeUlkKFxyXG4gICAgICAgICAgICAgIGxpbmtzLFxyXG4gICAgICAgICAgICAgIGl0ZW0uZmllbGRzLmluc3RydWN0b3Iuc3lzLmlkXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiU3Bla2FlcjogXCIsIHNwZWFrZXIpO1xyXG4gICAgICAgICAgICBjb25zdCBzcGVha2VyUGhvdG8gPSB0aGlzLmdldEFzc2V0QnlJZChcclxuICAgICAgICAgICAgICBhc3NldHMsXHJcbiAgICAgICAgICAgICAgc3BlYWtlci5maWVsZHMucGhvdG8uc3lzLmlkXHJcbiAgICAgICAgICAgICk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFdvcmtzaG9wKFxyXG4gICAgICAgICAgICAgIGl0ZW0uZmllbGRzLnRpdGxlLFxyXG4gICAgICAgICAgICAgIGl0ZW0uZmllbGRzLmRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgIG5ldyBTcGVha2VyKFxyXG4gICAgICAgICAgICAgICAgc3BlYWtlci5maWVsZHMubmFtZSxcclxuICAgICAgICAgICAgICAgIHNwZWFrZXIuZmllbGRzLnJvbGUsXHJcbiAgICAgICAgICAgICAgICBzcGVha2VyLmZpZWxkcy5iaW8sXHJcbiAgICAgICAgICAgICAgICBzcGVha2VyUGhvdG8gPyBzcGVha2VyUGhvdG8uZmllbGRzLmZpbGUudXJsIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgc3BlYWtlclBob3RvID8gc3BlYWtlclBob3RvLmZpZWxkcy50aXRsZSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgIHNwZWFrZXJQaG90byA/IHNwZWFrZXJQaG90by5maWVsZHMuZGVzY3JpcHRpb24gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICBzcGVha2VyLmZpZWxkcy5lbWFpbCxcclxuICAgICAgICAgICAgICAgIHNwZWFrZXIuZmllbGRzLnVybEdpdGh1YixcclxuICAgICAgICAgICAgICAgIHNwZWFrZXIuZmllbGRzLnVybExpbmtlZEluLFxyXG4gICAgICAgICAgICAgICAgc3BlYWtlci5maWVsZHMudXJsVHdpdHRlcixcclxuICAgICAgICAgICAgICAgIHNwZWFrZXIuZmllbGRzLnVybFd3d1xyXG4gICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgaXRlbS5maWVsZHMuc3RhcnREYXRlLFxyXG4gICAgICAgICAgICAgIGl0ZW0uZmllbGRzLmVuZERhdGUsXHJcbiAgICAgICAgICAgICAgMCwgLy8gVE9ETzogemFtaWVuacSHIG5hIHdzcMOzxYJyesSZZG5lXHJcbiAgICAgICAgICAgICAgMCwgLy8gVE9ETzogemFtaWVuacSHIG5hIHdzcMOzxYJyesSZZG5lXHJcbiAgICAgICAgICAgICAgaXRlbS5maWVsZHMubG9jYXRpb25EZXNjcmlwdGlvbixcclxuICAgICAgICAgICAgICBpdGVtLmZpZWxkcy5wcmljZVBsblxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgKTtcclxuICB9XHJcblxyXG4gIGdldFNwZWFrZXJzKGhvd01hbnk6IG51bWJlcik6IE9ic2VydmFibGU8QXJyYXk8U3BlYWtlcj4+IHtcclxuICAgIGNvbnN0IHF1ZXJ5ID0ge1xyXG4gICAgICBjb250ZW50X3R5cGU6IEV2ZW50Q29udGVudFR5cGVzLlNQRUFLRVIsXHJcbiAgICAgIGxvY2FsZTogdGhpcy5zZXR0aW5ncy5nZXRMb2NhbGUoKSxcclxuICAgICAgb3JkZXI6IFwic3lzLmNyZWF0ZWRBdFwiLFxyXG4gICAgICBsaW1pdDogaG93TWFueVxyXG4gICAgfTtcclxuXHJcbiAgICByZXR1cm4gdGhpcy5odHRwXHJcbiAgICAgIC5nZXQoXHJcbiAgICAgICAgYCR7dGhpcy5DT05URU5URlVMX1VSTF9FTlRSSUVTfSYke3RoaXMuZ2V0Q29udGVudGZ1bFVybFBhcmFtZXRlcnMoXHJcbiAgICAgICAgICBxdWVyeVxyXG4gICAgICAgICl9YCxcclxuICAgICAgICB7IHJlc3BvbnNlVHlwZTogXCJqc29uXCIgfVxyXG4gICAgICApXHJcbiAgICAgIC5waXBlKFxyXG4gICAgICAgIG1hcCgoZW50cmllczogRW50cnlDb2xsZWN0aW9uPGFueT4pID0+IHtcclxuICAgICAgICAgIGNvbnN0IGFzc2V0czogQXJyYXk8QXNzZXQ+ID0gZW50cmllcy5pbmNsdWRlcy5Bc3NldDtcclxuXHJcbiAgICAgICAgICByZXR1cm4gZW50cmllcy5pdGVtcy5tYXAoKGl0ZW06IEVudHJ5PGFueT4pID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcHJvZmlsZVBob3RvOiBBc3NldCA9IHRoaXMuZ2V0QXNzZXRCeUlkKFxyXG4gICAgICAgICAgICAgIGFzc2V0cyxcclxuICAgICAgICAgICAgICBpdGVtLmZpZWxkcy5waG90by5zeXMuaWRcclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgU3BlYWtlcihcclxuICAgICAgICAgICAgICBpdGVtLmZpZWxkcy5uYW1lLFxyXG4gICAgICAgICAgICAgIGl0ZW0uZmllbGRzLnJvbGUsXHJcbiAgICAgICAgICAgICAgaXRlbS5maWVsZHMuYmlvLFxyXG4gICAgICAgICAgICAgIHByb2ZpbGVQaG90byA/IHByb2ZpbGVQaG90by5maWVsZHMuZmlsZS51cmwgOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgcHJvZmlsZVBob3RvID8gcHJvZmlsZVBob3RvLmZpZWxkcy50aXRsZSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICBwcm9maWxlUGhvdG8gPyBwcm9maWxlUGhvdG8uZmllbGRzLmRlc2NyaXB0aW9uIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgIGl0ZW0uZmllbGRzLmVtYWlsLFxyXG4gICAgICAgICAgICAgIGl0ZW0uZmllbGRzLnVybEdpdGh1YixcclxuICAgICAgICAgICAgICBpdGVtLmZpZWxkcy51cmxMaW5rZWRJbixcclxuICAgICAgICAgICAgICBpdGVtLmZpZWxkcy51cmxUd2l0dGVyLFxyXG4gICAgICAgICAgICAgIGl0ZW0uZmllbGRzLnVybFd3d1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgKTtcclxuICB9XHJcblxyXG4gIG1hcmtkb3duVG9IdG1sKG1kOiBzdHJpbmcpIHtcclxuICAgIHJldHVybiBtYXJrZWQobWQpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRBc3NldEJ5SWQoYXNzZXRBcnJheTogQXJyYXk8QXNzZXQ+LCBpZDogc3RyaW5nKTogYW55IHtcclxuICAgIGlmIChhc3NldEFycmF5ICYmIGFzc2V0QXJyYXkubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zdCBuZXdBcnJheSA9IGFzc2V0QXJyYXkuZmlsdGVyKChpdGVtOiBBc3NldCkgPT4gaXRlbS5zeXMuaWQgPT09IGlkKTtcclxuICAgICAgaWYgKG5ld0FycmF5ICYmIG5ld0FycmF5Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICByZXR1cm4gbmV3QXJyYXlbMF07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge307XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldEFzc2V0c0J5SWRzKGFzc2V0QXJyYXk6IEFycmF5PEFzc2V0PiwgaWRzOiBBcnJheTxzdHJpbmc+KTogYW55IHtcclxuICAgIGlmIChhc3NldEFycmF5ICYmIGFzc2V0QXJyYXkubGVuZ3RoID4gMCAmJiBpZHMgJiYgaWRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgY29uc3QgbmV3QXJyYXkgPSBhc3NldEFycmF5LmZpbHRlcigoaXRlbTogQXNzZXQpID0+IHtcclxuICAgICAgICByZXR1cm4gaWRzLmluY2x1ZGVzKGl0ZW0uc3lzLmlkKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICByZXR1cm4gbmV3QXJyYXk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHt9O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRFbnRyeUJ5SWQoZW50cmllc0FycmF5OiBBcnJheTxFbnRyeTxhbnk+PiwgaWQ6IHN0cmluZyk6IGFueSB7XHJcbiAgICBpZiAoZW50cmllc0FycmF5ICYmIGVudHJpZXNBcnJheS5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGNvbnN0IG5ld0FycmF5ID0gZW50cmllc0FycmF5LmZpbHRlcihcclxuICAgICAgICAoaXRlbTogRW50cnk8YW55PikgPT4gaXRlbS5zeXMuaWQgPT09IGlkXHJcbiAgICAgICk7XHJcbiAgICAgIGlmIChuZXdBcnJheSAmJiBuZXdBcnJheS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ld0FycmF5WzBdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHt9O1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRFbnRyaWVzQnlDb250ZW50VHlwZShcclxuICAgIGVudHJpZXNBcnJheTogQXJyYXk8RW50cnk8YW55Pj4sXHJcbiAgICBjb250ZW50VHlwZTogRXZlbnRDb250ZW50VHlwZXNcclxuICApOiBhbnkge1xyXG4gICAgaWYgKGVudHJpZXNBcnJheSAmJiBlbnRyaWVzQXJyYXkubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zdCBuZXdBcnJheSA9IGVudHJpZXNBcnJheS5maWx0ZXIoXHJcbiAgICAgICAgKGl0ZW06IEVudHJ5PGFueT4pID0+IGl0ZW0uc3lzLmNvbnRlbnRUeXBlLnN5cy5pZCA9PT0gY29udGVudFR5cGVcclxuICAgICAgKTtcclxuICAgICAgaWYgKG5ld0FycmF5ICYmIG5ld0FycmF5Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICByZXR1cm4gbmV3QXJyYXk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge307XHJcbiAgfVxyXG5cclxufVxyXG4iXX0=