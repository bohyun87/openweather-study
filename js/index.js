// index JAVAscript Document

// 즉시실행 함수 안에 지도생성 함수 넣기
(function () {
  /* 3) 접속자 위치정보 가져오기 */

  /*현재 위치 가져오기
  navigator.geolocation.getCurrentPosition(function (위치정보 가져오기 성공했을 때 함수) {}, function (위치정보 가져오기 실패했을 때 함수) {} ); */

  navigator.geolocation.getCurrentPosition(getSuccess, getError);

  //가져오기 성공(허용)
  function getSuccess(position) {
    // position: 사용자의 위치 정보가 들어간다.
    const lat = position.coords.latitude; //위도
    const lon = position.coords.longitude; //경도

    console.log(lat, lon);
    // 5) 지도넣어주기
    loadMap(lat, lon);
  }

  //가져오기 실패(거부)
  function getError() {
    console.error("사용자의 위치정보를 가져오는데 실패했습니다.");
  }

  //4) 현재위치 지도로 보내주기  / 카카오맵 실행해주는 함수
  function loadMap(lat, lon) {
    /* 로드맵 함수 구성  -  1. 카카오맵 실행*/

    //카카오맵에서 지도생성하기 코드를 넣어준다.
    // 1) 카카오에서 코드 복사하기
    var mapContainer = document.getElementById("map"), // 지도를 표시할 div
      mapOption = {
        // 6) 매개변수 바꿔주기
        center: new kakao.maps.LatLng(lat, lon), // 지도의 중심좌표
        level: 3, // 지도의 확대 레벨
      };

    // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
    var map = new kakao.maps.Map(mapContainer, mapOption);
    // 6) 매개변수 바꿔주기
    var markerPosition = new kakao.maps.LatLng(lat, lon);

    /* 2.마커를 표시하기 */
    // 2) 마커를 생성합니다
    var marker = new kakao.maps.Marker({
      position: markerPosition,
    });

    /* 3. 마커표시하기 */
    // 마커가 지도 위에 표시되도록 설정합니다
    marker.setMap(map);

    /* ③ 좌표(위경도) => 주소변환 */

    // 주소-좌표 변환 객체를 생성합니다
    var geocoder = new kakao.maps.services.Geocoder();

    // 현재 지도 중심좌표로 주소를 검색해서 지도 좌측 상단에 표시합니다
    searchAddrFromCoords(map.getCenter(), displayCenterInfo);

    function searchAddrFromCoords(coords, callback) {
      // coords : 현재위치를 가져온 위.경도
      // callback : displayCenterInfo(result, status) 함수

      // 좌표로 행정동 주소 정보를 요청합니다
      geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);
    }

    // 지도 좌측상단에 지도 중심좌표에 대한 주소정보를 표출하는 함수입니다
    function displayCenterInfo(result, status) {
      if (status === kakao.maps.services.Status.OK) {
        for (var i = 0; i < result.length; i++) {
          // 행정동의 region_type 값은 'H' 이므로
          if (result[i].region_type === "H") {
            let juso = result[i];
            console.log(juso.region_1depth_name);
            console.log(juso.region_3depth_name);

            $(".region1-depth").text(juso.region_1depth_name);
            $(".region3-depth").text(juso.region_3depth_name);

            // 아래 오픈웨더에서 가져온 현재위치 기온 구하기
            let temp = getWeather(lat, lon);
            // 아래 ajax return 끝나고 나면 여기서 온도 뿌려주기
            $(".region-weather").text(`${temp.celsius}℃`);

            // 현재 기온에 맞게 아이콘 이미지 바꿔주기
            var iconURL =
              "https://openweathermap.org/img/wn/" + temp.icon + ".png";
            // .attr (iconURL 을 src로 바꿔주기)
            $(".region-icon").attr("src", iconURL);
            break;
          }
        }
      }
    }
  } // 카카오 로드맵 함수 끝

  //오픈웨더에서 기온 가져오기(ajax)
  function getWeather(lat, lon) {
    var urlAPI =
      "https://api.openweathermap.org/data/2.5/weather?appid=ba3969e6d4ca92775445b7987ba53fd5&units=metric&lang=kr";
    // 현재의 위치 값은 계속 변하기 때문에 urlAPI 와 분리하며 문자열 만들어줌
    urlAPI += "&lat=" + lat; // 현재 위치는 계속 바껴야되니까  lat, lon 으로 줌
    urlAPI += "&lon=" + lon;

    var temp = {};

    $.ajax({
      type: "GET", // request
      url: urlAPI, // "urlAPI" 사이에 넣으면 안됨
      dataType: "json",
      async: false, // 동기상태 => ajax 는 기본적으로 비동기 / false는 동기로 만들어주는것
      // return 값을 넘겨주기 위해서는 동기상태로 만들어야 됨
      success: function (data) {
        // console.log(data.main.temp);
        // (data.main.temp) main 안에 temp만 가져오기
        // 기온 소수점자리 정하기 위해 변수정하기
        const celsius = data.main.temp;

        // 아이콘 구하기
        const icon = data.weather[0].icon;
        // console.log(icon);

        temp.celsius = celsius.toFixed(0);
        temp.icon = icon;

        // console.log(temp);

        //웹에 현재기온 뿌려주기  // 변수.소수점자리 없애기
        // $(".region-weather").text(`${celsius.toFixed(0)}℃`);
        // 아래에서 return 하고 나면 위의 값은 필요없음
      },

      error: function (request, status, error) {
        console.log("code:" + request.status);
        console.log("message:" + request.responseText);
        console.log("error:" + error);
      },
    });

    return temp;
  }

  // 도시의 날씨 구하기
  function getWeatherWithCity(city) {
    var temp = {};
    var urlAPI =
      "https://api.openweathermap.org/data/2.5/weather?appid=ba3969e6d4ca92775445b7987ba53fd5&units=metric&lang=kr";
    urlAPI += "&q=" + city;

    $.ajax({
      type: "GET",
      url: urlAPI,
      dataType: "json",
      async: false,
      success: function (data) {
        const celsius = data.main.temp;
        const icon = data.weather[0].icon;

        temp.celsius = celsius.toFixed(0);
        temp.icon = icon;
      },

      error: function (request, status, error) {
        console.log("code:" + request.status);
        console.log("message:" + request.responseText);
        console.log("error:" + error);
      },
    });

    return temp;
  }

  var cityList = [
    "seoul",
    "incheon",
    "busan",
    "daegu",
    "daejeon",
    "jeju",
    "gangneung",
    "bucheon",
    "gimhae",
    "gyeongju",
    "iksan",
    "yeosu",
  ];

  for (const city of cityList) {
    // 각 도시의 날시를 구한다.
    let temp = getWeatherWithCity(city);
    console.log(city, temp);
    //온도
    $("." + city + "> .celsius").text(`${temp.celsius}℃`);
    //아이콘
    var iconURL = "https://openweathermap.org/img/wn/" + temp.icon + ".png";
    $("." + city + "> .icon > img").attr("src", iconURL);
  }
})();
