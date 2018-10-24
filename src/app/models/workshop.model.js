"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var location_model_1 = require("./location.model");
var Workshop = /** @class */ (function () {
    function Workshop(title, description, instructor, startDate, endDate, locationLon, locationLat, locationDescription, pricePln) {
        this.title = title;
        this.description = description;
        this.instructor = instructor;
        this.startDate = startDate;
        this.endDate = endDate;
        this.locationDescription = locationDescription;
        this.pricePln = pricePln;
        this.location = new location_model_1.Location(locationLat, locationLon);
    }
    return Workshop;
}());
exports.Workshop = Workshop;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3Nob3AubW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ3b3Jrc2hvcC5tb2RlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1EQUE0QztBQWM1QztJQUdFLGtCQUNTLEtBQWEsRUFDYixXQUFtQixFQUNuQixVQUFtQixFQUNuQixTQUFpQixFQUNqQixPQUFlLEVBQ3RCLFdBQW1CLEVBQ25CLFdBQW1CLEVBQ1osbUJBQTJCLEVBQzNCLFFBQWdCO1FBUmhCLFVBQUssR0FBTCxLQUFLLENBQVE7UUFDYixnQkFBVyxHQUFYLFdBQVcsQ0FBUTtRQUNuQixlQUFVLEdBQVYsVUFBVSxDQUFTO1FBQ25CLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFDakIsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUdmLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBUTtRQUMzQixhQUFRLEdBQVIsUUFBUSxDQUFRO1FBRXZCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSx5QkFBUSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBQ0gsZUFBQztBQUFELENBQUMsQUFoQkQsSUFnQkM7QUFoQlksNEJBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMb2NhdGlvbiB9IGZyb20gXCIuL2xvY2F0aW9uLm1vZGVsXCI7XG5pbXBvcnQgeyBTcGVha2VyIH0gZnJvbSBcIi4vc3BlYWtlci5tb2RlbFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIElXb3Jrc2hvcCB7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICBpbnN0cnVjdG9yPzogU3BlYWtlcjtcbiAgc3RhcnREYXRlPzogc3RyaW5nO1xuICBlbmREYXRlPzogc3RyaW5nO1xuICBsb2NhdGlvbj86IExvY2F0aW9uO1xuICBsb2NhdGlvbkRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICBwcmljZVBsbj86IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIFdvcmtzaG9wIGltcGxlbWVudHMgSVdvcmtzaG9wIHtcbiAgbG9jYXRpb246IExvY2F0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyB0aXRsZTogc3RyaW5nLFxuICAgIHB1YmxpYyBkZXNjcmlwdGlvbjogc3RyaW5nLFxuICAgIHB1YmxpYyBpbnN0cnVjdG9yOiBTcGVha2VyLFxuICAgIHB1YmxpYyBzdGFydERhdGU6IHN0cmluZyxcbiAgICBwdWJsaWMgZW5kRGF0ZTogc3RyaW5nLFxuICAgIGxvY2F0aW9uTG9uOiBudW1iZXIsXG4gICAgbG9jYXRpb25MYXQ6IG51bWJlcixcbiAgICBwdWJsaWMgbG9jYXRpb25EZXNjcmlwdGlvbjogc3RyaW5nLFxuICAgIHB1YmxpYyBwcmljZVBsbjogbnVtYmVyXG4gICkge1xuICAgIHRoaXMubG9jYXRpb24gPSBuZXcgTG9jYXRpb24obG9jYXRpb25MYXQsIGxvY2F0aW9uTG9uKTtcbiAgfVxufVxuIl19