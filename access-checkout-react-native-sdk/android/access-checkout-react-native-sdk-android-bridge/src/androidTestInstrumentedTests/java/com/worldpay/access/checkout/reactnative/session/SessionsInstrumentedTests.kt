package com.worldpay.access.checkout.reactnative.session

import android.content.Context
import androidx.test.core.app.ActivityScenario
import androidx.test.platform.app.InstrumentationRegistry
import com.github.tomakehurst.wiremock.client.WireMock.*
import com.worldpay.access.checkout.reactnative.services.AccessServicesRootStub
import com.worldpay.access.checkout.reactnative.services.MockServer
import com.worldpay.access.checkout.reactnative.services.MockServer.startStubServices
import com.worldpay.access.checkout.reactnative.services.MockServer.stopStubServices
import com.worldpay.access.checkout.reactnative.services.SessionsStub
import com.worldpay.access.checkout.reactnative.session.SessionsTestFixture.Companion.CARD
import com.worldpay.access.checkout.reactnative.session.SessionsTestFixture.Companion.CVC
import com.worldpay.access.checkout.reactnative.session.SessionsTestFixture.Companion.sessionsTextFixture
import org.awaitility.Awaitility.await
import org.junit.After
import org.junit.Before
import org.junit.Test
import java.util.concurrent.TimeUnit.MILLISECONDS


class SessionsInstrumentedTests {
    private val timeOutInMs = 5000L

    @Before
    fun setup() {
        sessionsTextFixture().clear()

        val context: Context = InstrumentationRegistry.getInstrumentation().context
        startStubServices(context, MockServer.PORT)

        AccessServicesRootStub.stubRootSuccess()
        SessionsStub.stubRootSuccess()
    }

    @After
    fun tearDown() {
        stopStubServices()
    }

    @Test
    fun testShouldBeAbleToGenerateACardSession() {
        SessionsStub.stubSessionsCardSuccess("my-session")
        sessionsTextFixture().pan("4444333322221111")
            .expiryDate("12/34")
            .cvc("123")
            .sessionsTypes(listOf(CARD))
            .reactNativeSdkVersion("1.0.0")

        val scenario = ActivityScenario.launch(SessionsInstrumentedTestsActivity::class.java)

        val expectedSessions = mapOf("card" to "my-session")
        assertSessionsAre(scenario, expectedSessions)
    }

    @Test
    fun testShouldBeAbleToGenerateACardAndACvcSession() {
        SessionsStub.stubSessionsCardSuccess("my-session")
        SessionsStub.stubSessionsPaymentsCvcSuccess("my-other-session")

        sessionsTextFixture().pan("4444333322221111")
            .expiryDate("12/34")
            .cvc("123")
            .sessionsTypes(listOf(CARD, CVC))
            .reactNativeSdkVersion("1.0.0")

        val scenario = ActivityScenario.launch(SessionsInstrumentedTestsActivity::class.java)

        val expectedSessions = mapOf(
            "card" to "my-session",
            "cvc" to "my-other-session"
        )
        assertSessionsAre(scenario, expectedSessions)
    }

    @Test
    fun testShouldBeAbleToGenerateACvcOnlySession() {
        SessionsStub.stubSessionsPaymentsCvcSuccess("my-other-session")

        sessionsTextFixture()
            .cvc("123")
            .sessionsTypes(listOf(CVC))
            .reactNativeSdkVersion("1.0.0")

        val scenario = ActivityScenario.launch(SessionsInstrumentedTestsActivity::class.java)

        val expectedSessions = mapOf(
            "cvc" to "my-other-session"
        )
        assertSessionsAre(scenario, expectedSessions)
    }

    @Test
    fun testShouldThrowExceptionWhenFailingGenerateSession() {
        val message = "Unable to generate session"
        val errorName = "Invalid Request"
        val expectedException = RuntimeException("$errorName : $message")

        SessionsStub.stubSessionsCardSuccess("my-session")
        SessionsStub.stubSessionsPaymentsCvcFailure(errorName, message)

        sessionsTextFixture()
            .pan("4444333322221111")
            .expiryDate("12/34")
            .cvc("123")
            .sessionsTypes(listOf(CARD, CVC))
            .reactNativeSdkVersion("1.0.0")

        val scenario = ActivityScenario.launch(SessionsInstrumentedTestsActivity::class.java)

        assertExceptionIs(scenario, expectedException)
    }

    @Test
    fun testShouldBeAbleToGiveErrorWhenSessionsTypeContainsCvcAndANullCvcIsPassed() {
        val exception = RuntimeException("Expected cvcValue to be provided but was not")

        sessionsTextFixture()
            .cvc(null)
            .sessionsTypes(listOf(CVC))
            .reactNativeSdkVersion("1.0.0")

        val scenario = ActivityScenario.launch(SessionsInstrumentedTestsActivity::class.java)

        assertExceptionIs(scenario, exception)
    }

    @Test
    fun testShouldSetNativeSdkWpSdkHeaderWithAccessCheckoutReactNativeVersion() {
        SessionsStub.stubSessionsCardSuccess("my-session")
        SessionsStub.stubSessionsPaymentsCvcSuccess("my-other-session")

        sessionsTextFixture().pan("4444333322221111")
            .expiryDate("12/34")
            .cvc("123")
            .sessionsTypes(listOf(CARD, CVC))
            .reactNativeSdkVersion("1.2.3")

        val scenario = ActivityScenario.launch(SessionsInstrumentedTestsActivity::class.java)

        val expectedSessions = mapOf(
            "card" to "my-session",
            "cvc" to "my-other-session"
        )
        assertSessionsAre(scenario, expectedSessions)

        verify(
            postRequestedFor(urlEqualTo("/sessions/payments/cvc"))
                .withHeader("X-WP-SDK", equalTo("access-checkout-react-native/1.2.3"))
        );
    }

    private fun assertSessionsAre(
        scenario: ActivityScenario<SessionsInstrumentedTestsActivity>,
        expectedMap: Map<String, String>
    ) {
        await().atMost(timeOutInMs, MILLISECONDS).until {
            var sessions: Map<String, String> = HashMap()
            scenario.onActivity { activity ->
                sessions = activity.sessions

            }

            sessions == expectedMap
        }
    }

    private fun assertExceptionIs(
        scenario: ActivityScenario<SessionsInstrumentedTestsActivity>,
        expectedException: RuntimeException
    ) {
        await().atMost(timeOutInMs, MILLISECONDS).until {
            var exception: RuntimeException? = null
            scenario.onActivity { activity ->
                if (activity.exception != null) {
                    exception = activity.exception
                }
            }

            if (exception == null) {
                false
            } else {
                when {
                    exception!!::class.java != expectedException::class.java -> {
                        throw AssertionError("Expected exception class to be '${expectedException::class.java.simpleName}' but was '${exception!!::class.java.simpleName}'")
                    }
                    exception!!.message != expectedException.message -> {
                        throw AssertionError("Expected exception message to be '${expectedException.message}' but was '${exception!!.message}'")
                    }
                    else -> {
                        true
                    }
                }
            }
        }
    }
}
